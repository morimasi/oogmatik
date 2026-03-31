import { z } from 'zod';
import { ActivityType } from './activity';

export const AnimationSegmentSchema = z.object({
    text: z.string(),
    isHighlight: z.boolean().optional(),
    color: z.string().optional(),
    duration: z.number().optional(), // frame sayısı
});

export const AnimationPropsSchema = z.object({
    title: z.string(),
    segments: z.array(AnimationSegmentSchema),
    pedagogicalNote: z.string(),
    templateType: z.string(),
    fps: z.number().default(30),
    durationInFrames: z.number().default(300),
});

export type AnimationSegment = z.infer<typeof AnimationSegmentSchema>;
export type AnimationProps = z.infer<typeof AnimationPropsSchema>;

export interface AnimationActivityResult {
    id: string;
    activityType: ActivityType;
    props: AnimationProps;
    timestamp: string;
}
