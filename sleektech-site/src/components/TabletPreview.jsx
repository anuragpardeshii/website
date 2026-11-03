import {
  ChevronLeft,
  ChevronRight,
  Copy,
  Ellipsis,
  LockKeyhole,
  PanelLeft,
  Plus,
  RotateCw,
  Share,
  Wifi,
  X,
} from "lucide-react";

export function TabletPreview({
  capability,
  stage,
  hostRef,
  paused,
  disabled,
  onTogglePause,
  children,
}) {
  const AppIcon = capability.icon;
  return (
    <div className="wb-tablet">
      <span className="wb-tablet-camera" aria-hidden="true" />
      <span className="wb-tablet-power" aria-hidden="true" />
      <span className="wb-tablet-volume" aria-hidden="true" />
      <div className="wb-tablet-screen">
        <div className="wb-tablet-status" aria-hidden="true">
          <span>9:41</span>
          <Ellipsis size={16} className="wb-tablet-multitask" />
          <span>
            <Wifi size={12} />
            <span className="wb-tablet-battery" />
          </span>
        </div>
        <div className="wb-demo wb-safari" ref={hostRef}>
          <div className="wb-safari-chrome" aria-hidden="true">
            <div className="wb-safari-toolbar">
              <div className="wb-safari-tools wb-safari-leading">
                <span className="wb-safari-lights">
                  <i />
                  <i />
                  <i />
                </span>
                <PanelLeft size={15} className="wb-safari-sidebar" />
                <ChevronLeft size={16} />
                <ChevronRight size={16} className="wb-safari-forward" />
              </div>
              <div className="wb-safari-address">
                <LockKeyhole size={10} />
                <span>{capability.app.toLowerCase()}.example</span>
                <RotateCw size={11} className="wb-safari-reload" />
              </div>
              <div className="wb-safari-tools wb-safari-trailing">
                <Share size={15} />
                <Plus size={16} className="wb-safari-new-tab" />
                <Copy size={14} />
              </div>
            </div>
            <div className="wb-safari-tabbar">
              <div className="wb-safari-tab">
                <AppIcon size={11} />
                <span>
                  {capability.app} — {stage}
                </span>
                <X size={9} />
              </div>
            </div>
          </div>
          {!disabled && (
            <button
              type="button"
              className="wb-motion-control"
              onClick={onTogglePause}
            >
              {paused
                ? "Resume solution animations"
                : "Pause solution animations"}
            </button>
          )}
          {children}
        </div>
        <div className="wb-tablet-home" aria-hidden="true">
          <i />
        </div>
      </div>
    </div>
  );
}
