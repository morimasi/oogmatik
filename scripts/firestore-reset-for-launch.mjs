/**
 * Firestore “ilk açılış” sıfırlama — GERİ ALINAMAZ.
 *
 * Siler (top-level koleksiyonların tüm dökümanları):
 *   saved_worksheets, saved_assessments, saved_curriculums, messages,
 *   feedbacks, activity_stats, assignments, approval_queue,
 *   feedback_signals, agent_tasks, agent_conversations, workbooks,
 *   workbook_versions, activity_drafts — ve students alt klasörleri
 *   (progress_history, progress_summary) ile öğrenci kök belgeleri.
 *
 * KORUR: users, config_* (config_activities, config_prompts, vb.), Auth kullanıcıları.
 *
 * users belgelerinde sıfırlar: worksheetCount=0, favorites=[], lastActiveActivity silinir.
 *
 * Çalıştırma (PowerShell örneği — proje kimliği her zaman elle verilmeli):
 *   $env:GOOGLE_CLOUD_PROJECT="ooggen-08916543-87358"
 *   $env:CONFIRM_LAUNCH_RESET="yes"
 *   npm run firestore:reset-launch
 *
 * Kimlik: GOOGLE_APPLICATION_CREDENTIALS=rehber\servis-hesabi.json VEYA
 *         gcloud auth application-default login (ADC).
 */

import admin from 'firebase-admin';

const PROJECT_ID =
  process.env.GOOGLE_CLOUD_PROJECT || process.env.GCLOUD_PROJECT;

if (!PROJECT_ID) {
  console.error(
    'GOOGLE_CLOUD_PROJECT (veya GCLOUD_PROJECT) zorunludur — örn. ooggen-08916543-87358.'
  );
  process.exit(1);
}

if (process.env.CONFIRM_LAUNCH_RESET !== 'yes') {
  console.error('Güvenlik: CONFIRM_LAUNCH_RESET=yes ayarlanmadan çalışmaz.');
  process.exit(1);
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId: PROJECT_ID,
  });
}

const db = admin.firestore();

const TOP_LEVEL_PURGE = [
  'saved_worksheets',
  'saved_assessments',
  'saved_curriculums',
  'messages',
  'feedbacks',
  'activity_stats',
  'assignments',
  'approval_queue',
  'feedback_signals',
  'agent_tasks',
  'agent_conversations',
  'workbooks',
  'workbook_versions',
  'activity_drafts',
];

async function purgeCollection(collRef, label) {
  let total = 0;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const snap = await collRef.limit(400).get();
    if (snap.empty) break;
    const batch = db.batch();
    for (const d of snap.docs) {
      batch.delete(d.ref);
    }
    await batch.commit();
    total += snap.size;
    process.stdout.write(`\r  ${label}: ${total} silindi...`);
  }
  if (total > 0) console.log('');
  return total;
}

async function purgeStudentsTree() {
  const roots = await db.collection('students').get();
  let n = 0;
  for (const sd of roots.docs) {
    const base = sd.ref;
    await purgeCollection(base.collection('progress_history'), 'progress_history');
    await purgeCollection(base.collection('progress_summary'), 'progress_summary');
    await base.delete();
    n += 1;
    process.stdout.write(`\r  students kök belge: ${n}/${roots.size}`);
  }
  console.log('');
}

async function resetUsersKeepAccounts() {
  const snap = await db.collection('users').get();
  let n = 0;
  let batch = db.batch();
  let count = 0;
  const BATCH = 400;

  const flush = async () => {
    if (!count) return;
    await batch.commit();
    n += count;
    batch = db.batch();
    count = 0;
    process.stdout.write(`\r  users güncellendi: ${n}...`);
  };

  for (const doc of snap.docs) {
    batch.update(doc.ref, {
      worksheetCount: 0,
      favorites: [],
      lastActiveActivity: admin.firestore.FieldValue.delete(),
    });
    count += 1;
    if (count >= BATCH) await flush();
  }
  await flush();
  console.log('');
  console.log(`  Users profil sıfırlandı: ${n}`);
}

async function main() {
  console.log(`Proje: ${PROJECT_ID}`);
  console.log('Koleksiyon silme işlemi başlıyor (users / config_* hariç)...\n');

  for (const name of TOP_LEVEL_PURGE) {
    const ref = db.collection(name);
    const n = await purgeCollection(ref, name);
    console.log(`✓ ${name}: ${n} doküman`);
  }

  console.log('\nstudents ağacı...');
  await purgeStudentsTree();
  console.log('✓ students');

  console.log('\nUsers (hesap sakla, istatistik/favorı sıfırla)...');
  await resetUsersKeepAccounts();

  console.log('\nTamamlandı.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
