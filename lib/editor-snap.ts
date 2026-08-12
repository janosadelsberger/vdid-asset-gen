import type { NormalizedBox, TemplateGuides } from "@/lib/custom-template";

export const SNAP_THRESHOLD_PX = 6;
export const SNAP_RELEASE_MULTIPLIER = 1.75;

export type SnapAnchorKind = "start" | "center" | "end";

export type SnapLock = {
  axis: "x" | "y";
  target: number;
  anchorKind: SnapAnchorKind;
};

export type ActiveSnapLines = {
  vertical?: number;
  horizontal?: number;
};

export function thresholdFromPx(px: number, canvasPx: number): number {
  if (canvasPx <= 0) return 0;
  return px / canvasPx;
}

export function buildSnapTargets(
  guides: TemplateGuides,
  includeCanvas = true,
): { vertical: number[]; horizontal: number[] } {
  const vertical = [...guides.vertical];
  const horizontal = [...guides.horizontal];
  if (includeCanvas) {
    vertical.push(0, 0.5, 1);
    horizontal.push(0, 0.5, 1);
  }
  return { vertical, horizontal };
}

type AxisAnchors = {
  start: number;
  center: number;
  end: number;
};

function axisAnchors(origin: number, size: number): AxisAnchors {
  return {
    start: origin,
    center: origin + size / 2,
    end: origin + size,
  };
}

function valueForAnchor(
  anchorKind: SnapAnchorKind,
  target: number,
  size: number,
): number {
  if (anchorKind === "start") return target;
  if (anchorKind === "center") return target - size / 2;
  return target - size;
}

function anchorValue(anchors: AxisAnchors, kind: SnapAnchorKind): number {
  return anchors[kind];
}

function snapAxis(
  axis: "x" | "y",
  origin: number,
  size: number,
  targets: number[],
  threshold: number,
  lock: SnapLock | undefined,
  proposedOrigin: number,
): {
  value: number;
  lock?: SnapLock;
  active?: number;
} {
  const release = threshold * SNAP_RELEASE_MULTIPLIER;
  const proposedAnchors = axisAnchors(proposedOrigin, size);

  if (lock && lock.axis === axis) {
    const rawAnchor = anchorValue(proposedAnchors, lock.anchorKind);
    if (Math.abs(rawAnchor - lock.target) <= release) {
      return {
        value: valueForAnchor(lock.anchorKind, lock.target, size),
        lock,
        active: lock.target,
      };
    }
  }

  const anchors = axisAnchors(origin, size);
  let bestDist = Infinity;
  let bestValue = origin;
  let bestLock: SnapLock | undefined;
  let bestActive: number | undefined;

  const kinds: SnapAnchorKind[] = ["start", "center", "end"];
  for (const kind of kinds) {
    const av = anchorValue(anchors, kind);
    for (const target of targets) {
      const dist = Math.abs(av - target);
      if (dist <= threshold && dist < bestDist) {
        bestDist = dist;
        bestValue = valueForAnchor(kind, target, size);
        bestLock = { axis, target, anchorKind: kind };
        bestActive = target;
      }
    }
  }

  return { value: bestValue, lock: bestLock, active: bestActive };
}

export function snapBoxMove(
  proposed: NormalizedBox,
  guides: TemplateGuides,
  thresholdX: number,
  thresholdY: number,
  locks?: { x?: SnapLock; y?: SnapLock },
): {
  box: NormalizedBox;
  locks: { x?: SnapLock; y?: SnapLock };
  activeLines: ActiveSnapLines;
} {
  const targets = buildSnapTargets(guides);
  const xSnap = snapAxis(
    "x",
    proposed.x,
    proposed.w,
    targets.vertical,
    thresholdX,
    locks?.x,
    proposed.x,
  );
  const ySnap = snapAxis(
    "y",
    proposed.y,
    proposed.h,
    targets.horizontal,
    thresholdY,
    locks?.y,
    proposed.y,
  );

  const box: NormalizedBox = {
    ...proposed,
    x: Math.min(1 - proposed.w, Math.max(0, xSnap.value)),
    y: Math.min(1 - proposed.h, Math.max(0, ySnap.value)),
  };

  return {
    box,
    locks: { x: xSnap.lock, y: ySnap.lock },
    activeLines: {
      vertical: xSnap.active,
      horizontal: ySnap.active,
    },
  };
}

export function snapBoxResize(
  proposed: NormalizedBox,
  guides: TemplateGuides,
  thresholdX: number,
  thresholdY: number,
  locks?: { x?: SnapLock; y?: SnapLock },
): {
  box: NormalizedBox;
  locks: { x?: SnapLock; y?: SnapLock };
  activeLines: ActiveSnapLines;
} {
  const targets = buildSnapTargets(guides);
  const right = proposed.x + proposed.w;
  const bottom = proposed.y + proposed.h;

  const snapEdge = (
    axis: "x" | "y",
    edge: number,
    start: number,
    targetsList: number[],
    threshold: number,
    lock: SnapLock | undefined,
    proposedEdge: number,
  ): { size: number; lock?: SnapLock; active?: number } => {
    const release = threshold * SNAP_RELEASE_MULTIPLIER;
    if (lock && lock.axis === axis && lock.anchorKind === "end") {
      if (Math.abs(proposedEdge - lock.target) <= release) {
        const size = lock.target - start;
        return { size: Math.max(0.02, size), lock, active: lock.target };
      }
    }
    let bestDist = Infinity;
    let bestSize = edge - start;
    let bestLock: SnapLock | undefined;
    let bestActive: number | undefined;
    for (const target of targetsList) {
      const dist = Math.abs(edge - target);
      if (dist <= threshold && dist < bestDist) {
        bestDist = dist;
        bestSize = target - start;
        bestLock = { axis, target, anchorKind: "end" };
        bestActive = target;
      }
    }
    return {
      size: Math.max(0.02, bestSize),
      lock: bestLock,
      active: bestActive,
    };
  };

  const xSnap = snapEdge(
    "x",
    right,
    proposed.x,
    targets.vertical,
    thresholdX,
    locks?.x,
    right,
  );
  const ySnap = snapEdge(
    "y",
    bottom,
    proposed.y,
    targets.horizontal,
    thresholdY,
    locks?.y,
    bottom,
  );

  return {
    box: {
      ...proposed,
      w: Math.min(1 - proposed.x, xSnap.size),
      h: Math.min(1 - proposed.y, ySnap.size),
    },
    locks: { x: xSnap.lock, y: ySnap.lock },
    activeLines: {
      vertical: xSnap.active,
      horizontal: ySnap.active,
    },
  };
}
