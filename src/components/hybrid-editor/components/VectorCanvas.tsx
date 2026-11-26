import React from 'react';
import {
  ActiveSelection,
  Canvas as FabricCanvas,
  Ellipse,
  FabricImage,
  FabricObject,
  Group,
  IText,
  Line,
  PencilBrush,
  Point,
  Polygon,
  Rect,
  Textbox,
  Triangle,
  loadSVGFromString,
  util,
  type TPointerEvent,
  Path,
  filters,
} from 'fabric';
import {
  MAX_ZOOM,
  MIN_ZOOM,
  clamp,
  type CanvasSnapshot,
  type EditorMode,
  type LayerInfo,
  type LayerPatch,
  type VectorCanvasHandle,
  type VectorStyle,
  type VectorTool,
} from '../types/editor.types';

type TaggedObject = FabricObject & { hxId?: string; hxKind?: string };

interface PointerEventInfo {
  e: TPointerEvent;
}

interface VectorCanvasProps {
  mode: EditorMode;
  width: number;
  height: number;
  zoom: number;
  tool: VectorTool;
  style: VectorStyle;
  snapshot: CanvasSnapshot;
  snapToGrid?: boolean;
  className?: string;
  onSnapshotChange: (snapshot: CanvasSnapshot) => void;
  onLayersChange: (layers: LayerInfo[]) => void;
  onSelectionChange: (ids: string[]) => void;
  onZoomChange: (zoom: number) => void;
  onToolConsumed?: (tool: VectorTool) => void;
  /** Ortak çalışma imleci: tuval yüzeyine göre piksel konumu; tuvalden çıkışta `null`. */
  onPointerActivity?: (point: { x: number; y: number } | null) => void;
}

const SHAPE_TOOLS: VectorTool[] = [
  'rect',
  'ellipse',
  'triangle',
  'diamond',
  'parallelogram',
  'hexagon',
  'cylinder',
  'cloud',
  'star',
  'line',
  'arrow',
  'arrow-double',
];

const newObjectId = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `obj_${crypto.randomUUID()}`;
  }
  return `obj_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
};

const ensureId = (object: FabricObject, kind?: string): string => {
  const tagged = object as TaggedObject;
  if (!tagged.hxId) tagged.hxId = newObjectId();
  if (kind && !tagged.hxKind) tagged.hxKind = kind;
  return tagged.hxId;
};

const findById = (canvas: FabricCanvas, id: string): FabricObject | undefined =>
  canvas.getObjects().find((object) => (object as TaggedObject).hxId === id);

const textContentOf = (object: FabricObject): string => {
  if (object instanceof IText || object instanceof Textbox) return object.text ?? '';
  if (object instanceof Group) {
    const texts = object
      .getObjects()
      .map((child) => textContentOf(child))
      .filter(Boolean);
    return texts.join(' ');
  }
  return '';
};

const toLayer = (object: FabricObject): LayerInfo => {
  const tagged = object as TaggedObject;
  const id = ensureId(object);
  const text = textContentOf(object).replace(/\s+/g, ' ').trim();
  const kind = tagged.hxKind ?? object.type;
  const label = text
    ? `${kind === 'sticky' ? 'Not' : 'Metin'}: ${text.slice(0, 28)}`
    : kind === 'path'
      ? 'Serbest çizim'
      : kind === 'group'
        ? 'Grup'
        : kind === 'rect'
          ? 'Dikdörtgen'
          : kind === 'ellipse' || kind === 'circle'
            ? 'Elips'
            : kind === 'triangle'
              ? 'Üçgen'
              : kind === 'polygon'
                ? 'Yıldız'
                : kind === 'line'
                  ? 'Çizgi'
                  : kind === 'i-text' || kind === 'textbox'
                    ? 'Metin kutusu'
                    : 'Nesne';

  const fill = typeof object.fill === 'string' ? object.fill : '';
  const stroke = typeof object.stroke === 'string' ? object.stroke : '';
  const strokeWidth = typeof object.strokeWidth === 'number' ? object.strokeWidth : 0;
  const fontSize =
    object instanceof IText || object instanceof Textbox ? (object.fontSize ?? 16) : 0;

  return {
    id,
    type: kind,
    label,
    visible: object.visible !== false,
    locked: object.lockMovementX === true && object.lockMovementY === true,
    x: Math.round(object.left ?? 0),
    y: Math.round(object.top ?? 0),
    width: Math.round(object.getScaledWidth()),
    height: Math.round(object.getScaledHeight()),
    angle: Math.round(object.angle ?? 0),
    opacity: Math.round((object.opacity ?? 1) * 100) / 100,
    fill,
    stroke,
    strokeWidth,
    fontSize,
    isGroup: object.type === 'group',
    hasText: text.length > 0,
  };
};

const collectLayers = (canvas: FabricCanvas): LayerInfo[] =>
  canvas
    .getObjects()
    .slice()
    .reverse()
    .map((object) => toLayer(object));

const starPoints = (outerRadius: number, innerRadius: number, points = 5): Array<{ x: number; y: number }> => {
  const result: Array<{ x: number; y: number }> = [];
  for (let index = 0; index < points * 2; index += 1) {
    const radius = index % 2 === 0 ? outerRadius : innerRadius;
    const angle = (Math.PI / points) * index - Math.PI / 2;
    result.push({ x: radius * Math.cos(angle), y: radius * Math.sin(angle) });
  }
  return result;
};

/**
 * Fabric.js v6 tabanlı vektör katmanı.
 *
 * - Serbest kalem (renk/kalınlık/opaklık), şekiller, oklar, metin ve yapışkan not
 * - Akıllı hizalama kılavuzları (merkez + diğer nesne kenarları)
 * - Sınırsız tahtada Space+sürükle pan, Ctrl+tekerlek zoom
 * - Katman/özellik paneli için seçim, sıralama, kilit, gizleme, gruplama API'si
 */
export const VectorCanvas = React.forwardRef<VectorCanvasHandle, VectorCanvasProps>(
  (
    {
      mode,
      width,
      height,
      zoom,
      tool,
      style,
      snapshot,
      snapToGrid = false,
      className = '',
      onSnapshotChange,
      onLayersChange,
      onSelectionChange,
      onZoomChange,
      onToolConsumed,
      onPointerActivity,
    },
    ref
  ) => {
    const containerRef = React.useRef<HTMLDivElement>(null);
    const canvasElRef = React.useRef<HTMLCanvasElement>(null);
    const canvasRef = React.useRef<FabricCanvas | null>(null);
    const [guides, setGuides] = React.useState<{ x: number | null; y: number | null }>({
      x: null,
      y: null,
    });
    const [laserPoint, setLaserPoint] = React.useState<{ x: number; y: number } | null>(null);

    const toolRef = React.useRef(tool);
    const styleRef = React.useRef(style);
    const modeRef = React.useRef(mode);
    const zoomRef = React.useRef(zoom);
    const snapToGridRef = React.useRef(snapToGrid);
    snapToGridRef.current = snapToGrid;
    const lastEmittedRef = React.useRef<string>('');
    const isLoadingRef = React.useRef(false);
    const isSpaceDownRef = React.useRef(false);
    const isPanningRef = React.useRef(false);
    const panOriginRef = React.useRef<{ x: number; y: number; vpt: number[] } | null>(null);
    const dragRef = React.useRef<{ start: Point; temp: FabricObject | null } | null>(null);

    const callbacksRef = React.useRef({
      onSnapshotChange,
      onLayersChange,
      onSelectionChange,
      onZoomChange,
      onToolConsumed,
      onPointerActivity,
    });
    callbacksRef.current = {
      onSnapshotChange,
      onLayersChange,
      onSelectionChange,
      onZoomChange,
      onToolConsumed,
      onPointerActivity,
    };

    toolRef.current = tool;
    styleRef.current = style;
    modeRef.current = mode;
    zoomRef.current = zoom;

    const emit = React.useCallback(() => {
      const canvas = canvasRef.current;
      if (!canvas || isLoadingRef.current) return;
      const json = JSON.stringify(canvas.toJSON());
      lastEmittedRef.current = json;
      callbacksRef.current.onSnapshotChange({
        json,
        width: canvas.getWidth(),
        height: canvas.getHeight(),
        zoom: canvas.getZoom(),
      });
      callbacksRef.current.onLayersChange(collectLayers(canvas));
      callbacksRef.current.onSelectionChange(
        canvas.getActiveObjects().map((object) => ensureId(object))
      );
    }, []);

    /** Yalnızca katman/seçim listesini yayınlar; belge geçmişini kirletmez. */
    const emitSelection = React.useCallback(() => {
      const canvas = canvasRef.current;
      if (!canvas || isLoadingRef.current) return;
      callbacksRef.current.onLayersChange(collectLayers(canvas));
      callbacksRef.current.onSelectionChange(
        canvas.getActiveObjects().map((object) => ensureId(object))
      );
    }, []);

    /* ------------------------------ Kurulum ------------------------------ */
    React.useEffect(() => {
      const element = canvasElRef.current;
      if (!element) return undefined;

      const canvas = new FabricCanvas(element, {
        width,
        height,
        backgroundColor: '#ffffff',
        preserveObjectStacking: true,
        selection: true,
        fireRightClick: false,
        stopContextMenu: true,
        controlsAboveOverlay: true,
      });
      canvasRef.current = canvas;

      const applySnapshot = (json: string) => {
        if (!json) return;
        lastEmittedRef.current = json;
        isLoadingRef.current = true;
        void canvas
          .loadFromJSON(json)
          .then(() => {
            canvas.getObjects().forEach((object) => ensureId(object));
            canvas.requestRenderAll();
          })
          .finally(() => {
            isLoadingRef.current = false;
            callbacksRef.current.onLayersChange(collectLayers(canvas));
          });
      };

      applySnapshot(snapshot.json);
      callbacksRef.current.onLayersChange(collectLayers(canvas));

      const handleAdded = (event: { target?: FabricObject }) => {
        if (event.target) ensureId(event.target);
        emit();
      };
      const handleModified = () => emit();
      const handleRemoved = () => emit();
      const handleSelection = () => emitSelection();

      canvas.on('object:added', handleAdded);
      canvas.on('object:modified', handleModified);
      canvas.on('object:removed', handleRemoved);
      canvas.on('selection:created', handleSelection);
      canvas.on('selection:updated', handleSelection);
      canvas.on('selection:cleared', handleSelection);
      canvas.on('path:created', (event) => {
        if (event.path) ensureId(event.path, 'drawing');
        emit();
      });

      /* ------------------------- Akıllı kılavuzlar ------------------------- */
      const handleMoving = (event: { target?: FabricObject }) => {
        const moving = event.target;
        if (!moving) return;
        const canvasZoom = canvas.getZoom() || 1;
        const threshold = 6 / canvasZoom;
        const center = moving.getCenterPoint();
        const halfWidth = moving.getScaledWidth() / 2;
        const halfHeight = moving.getScaledHeight() / 2;

        const verticalTargets: number[] = [canvas.getWidth() / 2];
        const horizontalTargets: number[] = [canvas.getHeight() / 2];

        canvas.getObjects().forEach((object) => {
          if (object === moving) return;
          if (object.visible === false) return;
          if (object instanceof ActiveSelection) return;
          const box = object.getBoundingRect();
          verticalTargets.push(box.left, box.left + box.width / 2, box.left + box.width);
          horizontalTargets.push(box.top, box.top + box.height / 2, box.top + box.height);
        });

        let snappedX: number | null = null;
        let snappedY: number | null = null;
        let nextLeft = moving.left ?? 0;
        let nextTop = moving.top ?? 0;

        const candidatesX = [center.x - halfWidth, center.x, center.x + halfWidth];
        for (const target of verticalTargets) {
          for (let index = 0; index < candidatesX.length; index += 1) {
            if (Math.abs(candidatesX[index] - target) <= threshold) {
              const delta = target - candidatesX[index];
              nextLeft += delta;
              snappedX = target;
              break;
            }
          }
          if (snappedX !== null) break;
        }

        const candidatesY = [center.y - halfHeight, center.y, center.y + halfHeight];
        for (const target of horizontalTargets) {
          for (let index = 0; index < candidatesY.length; index += 1) {
            if (Math.abs(candidatesY[index] - target) <= threshold) {
              const delta = target - candidatesY[index];
              nextTop += delta;
              snappedY = target;
              break;
            }
          }
          if (snappedY !== null) break;
        }

        if (snappedX !== null) moving.set({ left: nextLeft });
        if (snappedY !== null) moving.set({ top: nextTop });

        if (snapToGridRef.current) {
          const gridSize = 16;
          if (snappedX === null) moving.set({ left: Math.round((moving.left ?? 0) / gridSize) * gridSize });
          if (snappedY === null) moving.set({ top: Math.round((moving.top ?? 0) / gridSize) * gridSize });
        }

        setGuides({ x: snappedX, y: snappedY });
      };

      const handleMouseUpGlobal = () => {
        setGuides({ x: null, y: null });
      };

      canvas.on('object:moving', handleMoving);
      canvas.on('mouse:up', handleMouseUpGlobal);

      /* --------------------------- Şekil çizimi --------------------------- */
      const createArrow = (
        start: Point,
        end: Point,
        currentStyle: VectorStyle,
        doubleHeaded: boolean
      ): Group => {
        const line = new Line([start.x, start.y, end.x, end.y], {
          stroke: currentStyle.stroke,
          strokeWidth: currentStyle.strokeWidth,
          opacity: currentStyle.opacity,
          strokeLineCap: 'round',
        });
        const angle = (Math.atan2(end.y - start.y, end.x - start.x) * 180) / Math.PI;
        const headSize = 10 + currentStyle.strokeWidth * 2;
        const head = new Triangle({
          width: headSize,
          height: headSize * 1.5,
          fill: currentStyle.stroke,
          left: end.x,
          top: end.y,
          originX: 'center',
          originY: 'center',
          angle: angle + 90,
        });
        const parts: FabricObject[] = [line, head];
        if (doubleHeaded) {
          parts.push(
            new Triangle({
              width: headSize,
              height: headSize * 1.5,
              fill: currentStyle.stroke,
              left: start.x,
              top: start.y,
              originX: 'center',
              originY: 'center',
              angle: angle - 90,
            })
          );
        }
        return new Group(parts, { opacity: currentStyle.opacity });
      };

      const createSticky = (point: Point, currentStyle: VectorStyle): Group => {
        const note = new Rect({
          width: 220,
          height: 160,
          fill: '#FEF3C7',
          stroke: '#F59E0B',
          strokeWidth: 2,
          rx: 12,
          ry: 12,
        });
        const label = new Textbox('Yapışkan not…', {
          width: 196,
          left: 12,
          top: 12,
          fontFamily: currentStyle.fontFamily,
          fontSize: 16,
          fill: '#78350F',
          lineHeight: 1.35,
        });
        const group = new Group([note, label], { left: point.x, top: point.y });
        (group as TaggedObject).hxKind = 'sticky';
        return group;
      };

      const handleMouseDown = (info: PointerEventInfo) => {
        const pointer = info.e as MouseEvent;
        const activeTool = toolRef.current;

        if (modeRef.current === 'whiteboard' && (isSpaceDownRef.current || pointer.button === 1)) {
          isPanningRef.current = true;
          canvas.selection = false;
          panOriginRef.current = {
            x: pointer.clientX,
            y: pointer.clientY,
            vpt: [...(canvas.viewportTransform ?? [1, 0, 0, 1, 0, 0])],
          };
          canvas.defaultCursor = 'grabbing';
          return;
        }

        if (activeTool === 'select') return;

        const point = canvas.getScenePoint(info.e);
        const currentStyle = styleRef.current;

        if (activeTool === 'text') {
          const text = new IText('Metin yazın', {
            left: point.x,
            top: point.y,
            fontFamily: currentStyle.fontFamily,
            fontSize: currentStyle.fontSize,
            fill: currentStyle.textColor,
            opacity: currentStyle.opacity,
          });
          ensureId(text, 'text');
          canvas.add(text);
          canvas.setActiveObject(text);
          text.enterEditing();
          text.selectAll();
          canvas.requestRenderAll();
          callbacksRef.current.onToolConsumed?.('select');
          return;
        }

        if (activeTool === 'sticky') {
          const sticky = createSticky(point, currentStyle);
          canvas.add(sticky);
          canvas.setActiveObject(sticky);
          canvas.requestRenderAll();
          callbacksRef.current.onToolConsumed?.('select');
          return;
        }

        if (activeTool === 'pencil' || activeTool === 'highlighter' || activeTool === 'laser') return;

        if (SHAPE_TOOLS.includes(activeTool)) {
          let temp: FabricObject | null = null;
          if (activeTool === 'rect') {
            temp = new Rect({
              left: point.x,
              top: point.y,
              width: 1,
              height: 1,
              fill: currentStyle.fill,
              stroke: currentStyle.stroke,
              strokeWidth: currentStyle.strokeWidth,
              opacity: currentStyle.opacity,
              rx: 4,
              ry: 4,
            });
          } else if (activeTool === 'ellipse') {
            temp = new Ellipse({
              left: point.x,
              top: point.y,
              rx: 1,
              ry: 1,
              fill: currentStyle.fill,
              stroke: currentStyle.stroke,
              strokeWidth: currentStyle.strokeWidth,
              opacity: currentStyle.opacity,
            });
          } else if (activeTool === 'triangle') {
            temp = new Triangle({
              left: point.x,
              top: point.y,
              width: 1,
              height: 1,
              fill: currentStyle.fill,
              stroke: currentStyle.stroke,
              strokeWidth: currentStyle.strokeWidth,
              opacity: currentStyle.opacity,
            });
          } else if (activeTool === 'line' || activeTool === 'arrow' || activeTool === 'arrow-double') {
            temp = new Line([point.x, point.y, point.x, point.y], {
              stroke: currentStyle.stroke,
              strokeWidth: currentStyle.strokeWidth,
              opacity: currentStyle.opacity,
              strokeLineCap: 'round',
            });
          }

          if (temp) {
            ensureId(temp, activeTool);
            canvas.add(temp);
            canvas.setActiveObject(temp);
            dragRef.current = { start: point, temp };
          }
          return;
        }

        dragRef.current = { start: point, temp: null };
      };

      const handleMouseMove = (info: PointerEventInfo) => {
        const pointer = info.e as MouseEvent;

        if (isPanningRef.current && panOriginRef.current) {
          const origin = panOriginRef.current;
          const vpt = [...origin.vpt];
          vpt[4] += pointer.clientX - origin.x;
          vpt[5] += pointer.clientY - origin.y;
          canvas.setViewportTransform(vpt as [number, number, number, number, number, number]);
          return;
        }

        const drag = dragRef.current;
        if (!drag) return;
        const point = canvas.getScenePoint(info.e);
        const minX = Math.min(drag.start.x, point.x);
        const minY = Math.min(drag.start.y, point.y);
        const shapeWidth = Math.max(1, Math.abs(point.x - drag.start.x));
        const shapeHeight = Math.max(1, Math.abs(point.y - drag.start.y));
        const temp = drag.temp;

        if (temp instanceof Rect || temp instanceof Triangle) {
          temp.set({ left: minX, top: minY, width: shapeWidth, height: shapeHeight });
        } else if (temp instanceof Ellipse) {
          temp.set({
            left: minX,
            top: minY,
            rx: shapeWidth / 2,
            ry: shapeHeight / 2,
          });
        } else if (temp instanceof Line) {
          temp.set({ x2: point.x, y2: point.y });
        }

        temp?.setCoords();
        canvas.requestRenderAll();
      };

      const handleMouseUp = (info: PointerEventInfo) => {
        if (isPanningRef.current) {
          isPanningRef.current = false;
          panOriginRef.current = null;
          canvas.selection = true;
          canvas.defaultCursor = toolRef.current === 'pencil' ? 'crosshair' : 'default';
          return;
        }

        const drag = dragRef.current;
        dragRef.current = null;
        if (!drag) return;

        const point = canvas.getScenePoint(info.e);
        const activeTool = toolRef.current;
        const currentStyle = styleRef.current;
        const dragWidth = Math.abs(point.x - drag.start.x);
        const dragHeight = Math.abs(point.y - drag.start.y);
        const temp = drag.temp;

        if (temp instanceof Line && (activeTool === 'arrow' || activeTool === 'arrow-double')) {
          canvas.remove(temp);
          const end =
            dragWidth < 4 && dragHeight < 4
              ? new Point(drag.start.x + 160, drag.start.y + 40)
              : point;
          const arrow = createArrow(drag.start, end, currentStyle, activeTool === 'arrow-double');
          ensureId(arrow, 'arrow');
          canvas.add(arrow);
          canvas.setActiveObject(arrow);
          canvas.requestRenderAll();
          callbacksRef.current.onToolConsumed?.('select');
          return;
        }

        if (activeTool === 'star') {
          const starWidth = dragWidth < 4 ? 140 : dragWidth;
          const starHeight = dragHeight < 4 ? 140 : dragHeight;
          const star = new Polygon(starPoints(50, 22, 5), {
            left: dragWidth < 4 ? drag.start.x : Math.min(drag.start.x, point.x),
            top: dragHeight < 4 ? drag.start.y : Math.min(drag.start.y, point.y),
            fill: currentStyle.fill,
            stroke: currentStyle.stroke,
            strokeWidth: currentStyle.strokeWidth,
            opacity: currentStyle.opacity,
            objectCaching: false,
          });
          star.set({
            scaleX: Math.max(0.1, starWidth / 100),
            scaleY: Math.max(0.1, starHeight / 100),
          });
          ensureId(star, 'star');
          canvas.add(star);
          canvas.setActiveObject(star);
          canvas.requestRenderAll();
          callbacksRef.current.onToolConsumed?.('select');
          return;
        }

        if (temp) {
          if (dragWidth < 8 && dragHeight < 8) {
            if (temp instanceof Rect || temp instanceof Triangle) {
              temp.set({ width: 140, height: 90 });
            } else if (temp instanceof Ellipse) {
              temp.set({ rx: 70, ry: 45 });
            } else if (temp instanceof Line) {
              temp.set({ x2: drag.start.x + 160, y2: drag.start.y + 40 });
            }
            temp.setCoords();
          }
          canvas.setActiveObject(temp);
          canvas.requestRenderAll();
          callbacksRef.current.onToolConsumed?.('select');
        }
      };

      canvas.on('mouse:down', handleMouseDown);
      canvas.on('mouse:move', handleMouseMove);
      canvas.on('mouse:up', handleMouseUp);

      /* --------------------------- Ortak çalışma imleci --------------------------- */
      const handlePointerMove = (info: PointerEventInfo) => {
        const viewport = canvas.getViewportPoint(info.e);
        const point = { x: Math.round(viewport.x), y: Math.round(viewport.y) };

        if (toolRef.current === 'laser') {
          setLaserPoint(point);
        } else {
          setLaserPoint(null);
        }

        const callback = callbacksRef.current.onPointerActivity;
        if (callback) {
          callback(point);
        }
      };
      const handlePointerLeave = () => {
        setLaserPoint(null);
        callbacksRef.current.onPointerActivity?.(null);
      };
      canvas.on('mouse:move', handlePointerMove);
      element.addEventListener('mouseleave', handlePointerLeave);

      /* ----------------------------- Zoom/pan ----------------------------- */
      const handleWheel = (event: WheelEvent) => {
        if (!event.ctrlKey && !event.metaKey) return;
        event.preventDefault();
        const rect = element.getBoundingClientRect();
        const nextZoom = clamp(
          canvas.getZoom() * (event.deltaY < 0 ? 1.08 : 0.92),
          MIN_ZOOM,
          MAX_ZOOM
        );
        canvas.zoomToPoint(new Point(event.clientX - rect.left, event.clientY - rect.top), nextZoom);
        callbacksRef.current.onZoomChange(nextZoom);
      };
      containerRef.current?.addEventListener('wheel', handleWheel, { passive: false });

      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.code !== 'Space') return;
        const target = event.target;
        if (
          target instanceof HTMLElement &&
          (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))
        ) {
          return;
        }
        if (modeRef.current !== 'whiteboard') return;
        event.preventDefault();
        isSpaceDownRef.current = true;
        canvas.defaultCursor = 'grab';
      };
      const handleKeyUp = (event: KeyboardEvent) => {
        if (event.code !== 'Space') return;
        isSpaceDownRef.current = false;
        if (!isPanningRef.current) canvas.defaultCursor = 'default';
      };
      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('keyup', handleKeyUp);

      const containerEl = containerRef.current;
      return () => {
        containerEl?.removeEventListener('wheel', handleWheel);
        element.removeEventListener('mouseleave', handlePointerLeave);
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
        canvas.dispose();
        canvasRef.current = null;
      };
    }, []);

    /* ------------------------- Prop senkronizasyonu ------------------------- */
    React.useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      if (!snapshot.json || snapshot.json === lastEmittedRef.current) return;
      lastEmittedRef.current = snapshot.json;
      isLoadingRef.current = true;
      void canvas
        .loadFromJSON(snapshot.json)
        .then(() => {
          canvas.getObjects().forEach((object) => ensureId(object));
          canvas.requestRenderAll();
        })
        .finally(() => {
          isLoadingRef.current = false;
          callbacksRef.current.onLayersChange(collectLayers(canvas));
        });
    }, [snapshot.json]);

    React.useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      if (canvas.getWidth() !== width || canvas.getHeight() !== height) {
        canvas.setDimensions({ width, height });
        canvas.requestRenderAll();
      }
    }, [width, height]);

    React.useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      if (Math.abs(canvas.getZoom() - zoom) < 0.001) return;
      canvas.setZoom(zoom);
      canvas.requestRenderAll();
    }, [zoom]);

    React.useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const pencil = tool === 'pencil';
      const highlighter = tool === 'highlighter';
      const laser = tool === 'laser';

      canvas.isDrawingMode = pencil || highlighter;
      canvas.selection = !pencil && !highlighter && !laser && tool === 'select';
      canvas.skipTargetFind = pencil || highlighter || laser;

      if (highlighter) {
        const brush = new PencilBrush(canvas) as PencilBrush & { opacity?: number };
        brush.color = 'rgba(250, 204, 21, 0.45)';
        brush.width = 28;
        brush.decimate = 3;
        canvas.freeDrawingBrush = brush;
      } else {
        const brush = new PencilBrush(canvas) as PencilBrush & { opacity?: number };
        brush.color = style.stroke;
        brush.width = Math.max(1, style.strokeWidth * 2);
        brush.decimate = 3;
        canvas.freeDrawingBrush = brush;
      }

      canvas.defaultCursor =
        mode === 'whiteboard' && isSpaceDownRef.current
          ? 'grab'
          : laser
            ? 'none'
            : pencil || highlighter || SHAPE_TOOLS.includes(tool) || tool === 'text' || tool === 'sticky'
              ? 'crosshair'
              : 'default';
      canvas.requestRenderAll();
    }, [mode, style.stroke, style.strokeWidth, tool]);

    /* ------------------------------ İmperatif API ------------------------------ */
    const addShapeAtCenter = React.useCallback((shapeTool: VectorTool) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const currentStyle = styleRef.current;
      const centerX = canvas.getWidth() / 2;
      const centerY = canvas.getHeight() / 2;
      const common = {
        fill: currentStyle.fill,
        stroke: currentStyle.stroke,
        strokeWidth: currentStyle.strokeWidth,
        opacity: currentStyle.opacity,
      };
      let object: FabricObject | null = null;

      switch (shapeTool) {
        case 'rect':
          object = new Rect({ left: centerX - 90, top: centerY - 60, width: 180, height: 120, rx: 6, ry: 6, ...common });
          break;
        case 'ellipse':
          object = new Ellipse({ left: centerX - 80, top: centerY - 60, rx: 80, ry: 60, ...common });
          break;
        case 'triangle':
          object = new Triangle({ left: centerX - 80, top: centerY - 70, width: 160, height: 140, ...common });
          break;
        case 'diamond':
          object = new Polygon(
            [
              { x: 80, y: 0 },
              { x: 160, y: 70 },
              { x: 80, y: 140 },
              { x: 0, y: 70 },
            ],
            { left: centerX - 80, top: centerY - 70, ...common }
          );
          break;
        case 'parallelogram':
          object = new Polygon(
            [
              { x: 40, y: 0 },
              { x: 180, y: 0 },
              { x: 140, y: 110 },
              { x: 0, y: 110 },
            ],
            { left: centerX - 90, top: centerY - 55, ...common }
          );
          break;
        case 'hexagon':
          object = new Polygon(
            [
              { x: 40, y: 0 },
              { x: 120, y: 0 },
              { x: 160, y: 70 },
              { x: 120, y: 140 },
              { x: 40, y: 140 },
              { x: 0, y: 70 },
            ],
            { left: centerX - 80, top: centerY - 70, ...common }
          );
          break;
        case 'cylinder': {
          const topEl = new Ellipse({ rx: 60, ry: 20, fill: currentStyle.fill, stroke: currentStyle.stroke, strokeWidth: currentStyle.strokeWidth });
          const bottomEl = new Ellipse({ rx: 60, ry: 20, top: 90, fill: currentStyle.fill, stroke: currentStyle.stroke, strokeWidth: currentStyle.strokeWidth });
          const body = new Rect({ left: -60, top: 20, width: 120, height: 90, fill: currentStyle.fill, stroke: currentStyle.stroke, strokeWidth: currentStyle.strokeWidth });
          object = new Group([bottomEl, body, topEl], { left: centerX - 60, top: centerY - 65, opacity: currentStyle.opacity });
          break;
        }
        case 'cloud': {
          const cloudSvg = 'M25 45 a20 20 0 0 1 35 -12 a25 25 0 0 1 45 5 a20 20 0 0 1 35 15 a15 15 0 0 1 -10 22 h-95 a15 15 0 0 1 -10 -30 z';
          object = new Path(cloudSvg, {
            left: centerX - 80,
            top: centerY - 50,
            scaleX: 1.2,
            scaleY: 1.2,
            ...common,
          });
          break;
        }
        case 'star': {
          const star = new Polygon(starPoints(60, 26, 5), {
            originX: 'center',
            originY: 'center',
            left: centerX,
            top: centerY,
            ...common,
          });
          object = star;
          break;
        }
        case 'line':
          object = new Line([centerX - 100, centerY, centerX + 100, centerY], {
            stroke: currentStyle.stroke,
            strokeWidth: currentStyle.strokeWidth,
            opacity: currentStyle.opacity,
            strokeLineCap: 'round',
          });
          break;
        case 'arrow':
        case 'arrow-double': {
          const start = new Point(centerX - 100, centerY);
          const end = new Point(centerX + 100, centerY);
          const head = new Triangle({
            width: 14,
            height: 20,
            fill: currentStyle.stroke,
            left: end.x,
            top: end.y,
            originX: 'center',
            originY: 'center',
            angle: 90,
          });
          const parts: FabricObject[] = [
            new Line([start.x, start.y, end.x, end.y], {
              stroke: currentStyle.stroke,
              strokeWidth: currentStyle.strokeWidth,
              strokeLineCap: 'round',
            }),
            head,
          ];
          if (shapeTool === 'arrow-double') {
            parts.push(
              new Triangle({
                width: 14,
                height: 20,
                fill: currentStyle.stroke,
                left: start.x,
                top: start.y,
                originX: 'center',
                originY: 'center',
                angle: -90,
              })
            );
          }
          object = new Group(parts, { opacity: currentStyle.opacity });
          break;
        }
        case 'text': {
          const text = new IText('Metin yazın', {
            left: centerX - 90,
            top: centerY - 20,
            fontFamily: currentStyle.fontFamily,
            fontSize: currentStyle.fontSize,
            fill: currentStyle.textColor,
          });
          ensureId(text, 'text');
          canvas.add(text);
          canvas.setActiveObject(text);
          text.enterEditing();
          canvas.requestRenderAll();
          emit();
          return;
        }
        case 'sticky': {
          const note = new Rect({ width: 220, height: 160, fill: '#FEF3C7', stroke: '#F59E0B', strokeWidth: 2, rx: 12, ry: 12 });
          const label = new Textbox('Yapışkan not…', {
            width: 196,
            left: 12,
            top: 12,
            fontFamily: currentStyle.fontFamily,
            fontSize: 16,
            fill: '#78350F',
          });
          const group = new Group([note, label], { left: centerX - 110, top: centerY - 80 });
          (group as TaggedObject).hxKind = 'sticky';
          ensureId(group, 'sticky');
          canvas.add(group);
          canvas.setActiveObject(group);
          canvas.requestRenderAll();
          emit();
          return;
        }
        default:
          return;
      }

      if (object) {
        ensureId(object, shapeTool);
        canvas.add(object);
        canvas.setActiveObject(object);
        canvas.requestRenderAll();
        emit();
      }
    }, [emit]);

    React.useImperativeHandle(
      ref,
      (): VectorCanvasHandle => ({
        addShape: (shapeTool) => addShapeAtCenter(shapeTool),
        addText: () => addShapeAtCenter('text'),
        addSticky: () => addShapeAtCenter('sticky'),
        deleteSelection: () => {
          const canvas = canvasRef.current;
          if (!canvas) return;
          const targets = canvas.getActiveObjects();
          if (!targets.length) return;
          targets.forEach((object) => canvas.remove(object));
          canvas.discardActiveObject();
          canvas.requestRenderAll();
          emit();
        },
        duplicateSelection: () => {
          const canvas = canvasRef.current;
          if (!canvas) return;
          const targets = canvas.getActiveObjects();
          if (!targets.length) return;
          targets.forEach((object) => {
            void object.clone().then((clone) => {
              clone.set({ left: (object.left ?? 0) + 24, top: (object.top ?? 0) + 24 });
              ensureId(clone, (object as TaggedObject).hxKind);
              canvas.add(clone);
              canvas.setActiveObject(clone);
              canvas.requestRenderAll();
              emit();
            });
          });
        },
        groupSelection: () => {
          const canvas = canvasRef.current;
          if (!canvas) return;
          const targets = canvas.getActiveObjects().filter((object) => object.type !== 'activeSelection');
          if (targets.length < 2) return;
          canvas.discardActiveObject();
          targets.forEach((object) => canvas.remove(object));
          const group = new Group(targets, {});
          (group as TaggedObject).hxKind = 'group';
          ensureId(group, 'group');
          canvas.add(group);
          canvas.setActiveObject(group);
          canvas.requestRenderAll();
          emit();
        },
        ungroupSelection: () => {
          const canvas = canvasRef.current;
          if (!canvas) return;
          const active = canvas.getActiveObject();
          if (!active || active.type !== 'group') return;
          const group = active as Group;
          const left = group.left ?? 0;
          const top = group.top ?? 0;
          const scaleX = group.scaleX ?? 1;
          const scaleY = group.scaleY ?? 1;
          const children = group.removeAll();
          canvas.remove(group);
          children.forEach((child) => {
            child.set({
              left: (child.left ?? 0) * scaleX + left,
              top: (child.top ?? 0) * scaleY + top,
            });
            child.setCoords();
            ensureId(child);
            canvas.add(child);
          });
          if (children.length) canvas.setActiveObject(new ActiveSelection(children, { canvas }));
          canvas.requestRenderAll();
          emit();
        },
        reorder: (action) => {
          const canvas = canvasRef.current;
          if (!canvas) return;
          const targets = canvas.getActiveObjects();
          if (!targets.length) return;
          const ordered = action === 'front' || action === 'forward' ? targets : [...targets].reverse();
          ordered.forEach((object) => {
            if (action === 'front') canvas.bringObjectToFront(object);
            else if (action === 'forward') canvas.bringObjectForward(object);
            else if (action === 'backward') canvas.sendObjectBackwards(object);
            else canvas.sendObjectToBack(object);
          });
          canvas.requestRenderAll();
          emit();
        },
        toggleLock: () => {
          const canvas = canvasRef.current;
          if (!canvas) return;
          const targets = canvas.getActiveObjects();
          if (!targets.length) return;
          const shouldLock = !targets.every((object) => object.lockMovementX);
          targets.forEach((object) => {
            object.set({
              lockMovementX: shouldLock,
              lockMovementY: shouldLock,
              lockScalingX: shouldLock,
              lockScalingY: shouldLock,
              lockRotation: shouldLock,
              selectable: !shouldLock,
              hoverCursor: shouldLock ? 'not-allowed' : 'move',
            });
          });
          canvas.requestRenderAll();
          emit();
        },
        toggleVisible: () => {
          const canvas = canvasRef.current;
          if (!canvas) return;
          const targets = canvas.getActiveObjects();
          if (!targets.length) return;
          const shouldHide = targets.some((object) => object.visible !== false);
          targets.forEach((object) => object.set({ visible: !shouldHide }));
          canvas.discardActiveObject();
          canvas.requestRenderAll();
          emit();
        },
        selectByIds: (ids) => {
          const canvas = canvasRef.current;
          if (!canvas) return;
          const objects = ids
            .map((id) => findById(canvas, id))
            .filter((object): object is FabricObject => !!object && object.visible !== false);
          if (!objects.length) {
            canvas.discardActiveObject();
          } else if (objects.length === 1) {
            canvas.setActiveObject(objects[0]);
          } else {
            canvas.setActiveObject(new ActiveSelection(objects, { canvas }));
          }
          canvas.requestRenderAll();
          emit();
        },
        updateSelection: (patch: LayerPatch) => {
          const canvas = canvasRef.current;
          if (!canvas) return;
          const targets = canvas.getActiveObjects();
          if (!targets.length) return;
          targets.forEach((object) => {
            if (typeof patch.x === 'number') object.set({ left: patch.x });
            if (typeof patch.y === 'number') object.set({ top: patch.y });
            if (typeof patch.width === 'number' && (object.width ?? 0) > 0) {
              object.set({ scaleX: patch.width / (object.width as number) });
            }
            if (typeof patch.height === 'number' && (object.height ?? 0) > 0) {
              object.set({ scaleY: patch.height / (object.height as number) });
            }
            if (typeof patch.angle === 'number') object.set({ angle: patch.angle });
            if (typeof patch.opacity === 'number') object.set({ opacity: clamp(patch.opacity, 0, 1) });
            if (typeof patch.fill === 'string') object.set({ fill: patch.fill });
            if (typeof patch.stroke === 'string') object.set({ stroke: patch.stroke });
            if (typeof patch.strokeWidth === 'number') object.set({ strokeWidth: patch.strokeWidth });
            if (typeof patch.fontSize === 'number' && (object instanceof IText || object instanceof Textbox)) {
              object.set({ fontSize: patch.fontSize });
            }
            object.setCoords();
          });
          canvas.requestRenderAll();
          emit();
        },
        applyStyle: (nextStyle) => {
          const canvas = canvasRef.current;
          if (!canvas) return;
          const targets = canvas.getActiveObjects();
          if (!targets.length) return;
          targets.forEach((object) => {
            if (object instanceof IText || object instanceof Textbox) {
              object.set({
                fontFamily: nextStyle.fontFamily,
                fontSize: nextStyle.fontSize,
                fill: nextStyle.textColor,
                opacity: nextStyle.opacity,
              });
            } else if (object instanceof Line || object.type === 'path') {
              object.set({
                stroke: nextStyle.stroke,
                strokeWidth: nextStyle.strokeWidth,
                opacity: nextStyle.opacity,
              });
            } else {
              object.set({
                fill: nextStyle.fill,
                stroke: nextStyle.stroke,
                strokeWidth: nextStyle.strokeWidth,
                opacity: nextStyle.opacity,
              });
            }
            object.setCoords();
          });
          canvas.requestRenderAll();
          emit();
        },
        getSnapshot: () => {
          const canvas = canvasRef.current;
          if (!canvas) {
            return { json: snapshot.json, width, height, zoom };
          }
          return {
            json: JSON.stringify(canvas.toJSON()),
            width: canvas.getWidth(),
            height: canvas.getHeight(),
            zoom: canvas.getZoom(),
          };
        },
        loadSnapshot: (nextSnapshot) => {
          const canvas = canvasRef.current;
          if (!canvas) return;
          lastEmittedRef.current = nextSnapshot.json;
          isLoadingRef.current = true;
          void canvas
            .loadFromJSON(nextSnapshot.json)
            .then(() => {
              canvas.getObjects().forEach((object) => ensureId(object));
              canvas.requestRenderAll();
            })
            .finally(() => {
              isLoadingRef.current = false;
              emit();
            });
        },
        exportPng: (options = {}) => {
          const canvas = canvasRef.current;
          if (!canvas) return null;
          const multiplier = options.multiplier ?? 2;
          const previousBackground = canvas.backgroundColor;
          if (options.transparent) canvas.backgroundColor = '';

          const active = canvas.getActiveObjects();
          const targets =
            options.selectionOnly && active.length ? active : canvas.getObjects();
          if (!targets.length) {
            canvas.backgroundColor = previousBackground;
            return null;
          }

          let minLeft = Number.POSITIVE_INFINITY;
          let minTop = Number.POSITIVE_INFINITY;
          let maxRight = Number.NEGATIVE_INFINITY;
          let maxBottom = Number.NEGATIVE_INFINITY;
          targets.forEach((object) => {
            const box = object.getBoundingRect();
            minLeft = Math.min(minLeft, box.left);
            minTop = Math.min(minTop, box.top);
            maxRight = Math.max(maxRight, box.left + box.width);
            maxBottom = Math.max(maxBottom, box.top + box.height);
          });

          const pad = 16;
          const dataUrl = canvas.toDataURL({
            format: 'png',
            multiplier,
            left: Math.max(0, minLeft - pad),
            top: Math.max(0, minTop - pad),
            width: Math.max(1, maxRight - minLeft + pad * 2),
            height: Math.max(1, maxBottom - minTop + pad * 2),
          });
          canvas.backgroundColor = previousBackground;
          canvas.requestRenderAll();
          return dataUrl;
        },
        exportSvg: () => {
          const canvas = canvasRef.current;
          if (!canvas || !canvas.getObjects().length) return null;
          return canvas.toSVG();
        },
        applyImageFilter: (filterType, options) => {
          const canvas = canvasRef.current;
          if (!canvas) return;
          const targets = canvas.getActiveObjects();
          if (!targets.length) return;

          targets.forEach((obj) => {
            if (obj instanceof FabricImage) {
              const activeFilters = [];
              if (filterType === 'grayscale') {
                activeFilters.push(new filters.Grayscale());
              } else if (filterType === 'sepia') {
                activeFilters.push(new filters.Sepia());
              } else if (filterType === 'invert') {
                activeFilters.push(new filters.Invert());
              }

              if (typeof options?.brightness === 'number') {
                activeFilters.push(new filters.Brightness({ brightness: options.brightness }));
              }
              if (typeof options?.contrast === 'number') {
                activeFilters.push(new filters.Contrast({ contrast: options.contrast }));
              }

              obj.filters = activeFilters;
              obj.applyFilters();
            }
          });

          canvas.requestRenderAll();
          emit();
        },
        addSvg: (svgString, label) => {
          const canvas = canvasRef.current;
          if (!canvas || !svgString.trim()) return;
          void loadSVGFromString(svgString)
            .then(({ objects, options }) => {
              const valid = objects.filter((item): item is FabricObject => item !== null);
              if (!valid.length) return;
              const group = util.groupSVGElements(valid, options);
              const boundsWidth = group.width ?? 120;
              const boundsHeight = group.height ?? 120;
              const maxWidth = Math.min(360, canvas.getWidth() * 0.6);
              const maxHeight = Math.min(360, canvas.getHeight() * 0.6);
              const scale = Math.min(1, maxWidth / Math.max(1, boundsWidth), maxHeight / Math.max(1, boundsHeight));
              group.set({
                left: canvas.getWidth() / 2 - (boundsWidth * scale) / 2,
                top: canvas.getHeight() / 2 - (boundsHeight * scale) / 2,
                scaleX: scale,
                scaleY: scale,
                opacity: styleRef.current.opacity,
              });
              ensureId(group, label ?? 'svg');
              canvas.add(group);
              canvas.setActiveObject(group);
              canvas.requestRenderAll();
              emit();
            })
            .catch(() => undefined);
        },
        resetViewport: () => {
          const canvas = canvasRef.current;
          if (!canvas) return;
          canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
          canvas.requestRenderAll();
          callbacksRef.current.onZoomChange(1);
        },
        addImage: (dataUrl) => {
          const canvas = canvasRef.current;
          if (!canvas || !dataUrl) return;
          void FabricImage.fromURL(dataUrl)
            .then((image) => {
              const naturalWidth = image.width ?? 0;
              const naturalHeight = image.height ?? 0;
              if (!naturalWidth || !naturalHeight) return;
              const maxWidth = Math.min(520, canvas.getWidth() * 0.7);
              const maxHeight = Math.min(420, canvas.getHeight() * 0.7);
              const scale = Math.min(1, maxWidth / naturalWidth, maxHeight / naturalHeight);
              image.set({
                left: canvas.getWidth() / 2 - (naturalWidth * scale) / 2,
                top: canvas.getHeight() / 2 - (naturalHeight * scale) / 2,
                scaleX: scale,
                scaleY: scale,
                opacity: styleRef.current.opacity,
              });
              ensureId(image, 'image');
              canvas.add(image);
              canvas.setActiveObject(image);
              canvas.requestRenderAll();
              emit();
            })
            .catch(() => undefined);
        },
        nudgeSelection: (dx, dy) => {
          const canvas = canvasRef.current;
          if (!canvas) return;
          const targets = canvas.getActiveObjects();
          if (!targets.length) return;
          targets.forEach((object) => {
            object.set({ left: (object.left ?? 0) + dx, top: (object.top ?? 0) + dy });
            object.setCoords();
          });
          canvas.requestRenderAll();
          emit();
        },
        clearSelection: () => {
          const canvas = canvasRef.current;
          if (!canvas) return;
          canvas.discardActiveObject();
          canvas.requestRenderAll();
          emitSelection();
        },
        clear: () => {
          const canvas = canvasRef.current;
          if (!canvas) return;
          canvas.clear();
          canvas.backgroundColor = '#ffffff';
          canvas.requestRenderAll();
          emit();
        },
      }),
      [addShapeAtCenter, emit, height, snapshot.json, width, zoom]
    );

    return (
      <div
        ref={containerRef}
        className={`hybrid-canvas relative overflow-hidden ${className}`}
        style={{ width, height }}
        data-mode={mode}
        data-tool={tool}
      >
        <canvas ref={canvasElRef} />
        {guides.x !== null && (
          <div
            className="pointer-events-none absolute top-0 bottom-0 z-10 w-px bg-indigo-500/80"
            style={{ left: guides.x }}
          />
        )}
        {guides.y !== null && (
          <div
            className="pointer-events-none absolute left-0 right-0 z-10 h-px bg-indigo-500/80"
            style={{ top: guides.y }}
          />
        )}
        {laserPoint !== null && (
          <div
            className="pointer-events-none absolute z-50 -translate-x-1/2 -translate-y-1/2 rounded-full transition-transform"
            style={{
              left: laserPoint.x,
              top: laserPoint.y,
              width: 18,
              height: 18,
              backgroundColor: '#ef4444',
              boxShadow: '0 0 16px 6px rgba(239, 68, 68, 0.75), 0 0 4px 2px #ffffff',
            }}
          />
        )}
      </div>
    );
  }
);

VectorCanvas.displayName = 'VectorCanvas';

export default VectorCanvas;
