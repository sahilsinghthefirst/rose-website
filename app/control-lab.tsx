"use client";

import { Pause, Play, RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";

const tools = ["Grip", "Place", "Make"] as const;
type Tool = (typeof tools)[number];

export function ControlLab() {
  const [shoulder, setShoulder] = useState(-28);
  const [elbow, setElbow] = useState(46);
  const [wrist, setWrist] = useState(-18);
  const [tool, setTool] = useState<Tool>("Grip");
  const [playing, setPlaying] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      setReducedMotion(preference.matches);
      if (preference.matches) setPlaying(false);
    };
    sync();
    preference.addEventListener("change", sync);
    return () => preference.removeEventListener("change", sync);
  }, []);

  function reset() {
    setPlaying(false);
    setShoulder(-28);
    setElbow(46);
    setWrist(-18);
    setTool("Grip");
  }

  return (
    <section className="control-lab-section" aria-labelledby="control-lab-title">
      <div className="control-lab-heading" data-reveal>
        <span className="section-kicker">Interactive control concept</span>
        <h2 id="control-lab-title">Move the idea before the machine.</h2>
        <p>Explore how visible intent could make robotic motion easier to understand.</p>
      </div>

      <div className="control-lab-shell" data-playing={playing} data-reveal>
        <div className="lab-viewport">
          <div className="lab-status">
            <span>Concept simulation</span>
            <strong>{playing ? "Previewing motion" : "Ready to explore"}</strong>
          </div>

          <div className="lab-orbits" aria-hidden="true"><i /><i /><i /></div>
          <div className="lab-arm" aria-hidden="true">
            <span className="lab-base" />
            <div className="lab-link lab-link-one" style={{ transform: `rotate(${shoulder}deg)` }}>
              <i className="lab-joint" />
              <div className="lab-link lab-link-two" style={{ transform: `rotate(${elbow}deg)` }}>
                <i className="lab-joint" />
                <div className="lab-link lab-link-three" style={{ transform: `rotate(${wrist}deg)` }}>
                  <i className="lab-joint" />
                  <span className="lab-tool" data-tool={tool.toLowerCase()} />
                </div>
              </div>
            </div>
          </div>

          <div className="lab-readout" aria-hidden="true">
            <span>SHOULDER <b>{playing ? "LIVE" : `${Math.round(shoulder)}°`}</b></span>
            <span>ELBOW <b>{playing ? "LIVE" : `${Math.round(elbow)}°`}</b></span>
            <span>WRIST <b>{playing ? "LIVE" : `${Math.round(wrist)}°`}</b></span>
          </div>
        </div>

        <div className="lab-controls">
          <div className="lab-control-heading">
            <div><span>Motion sandbox</span><strong>Joint explorer</strong></div>
            <button type="button" onClick={reset} aria-label="Reset motion sandbox"><RotateCcw size={17} /></button>
          </div>

          <label>
            <span><b>Shoulder</b><output>{Math.round(shoulder)}°</output></span>
            <input type="range" min="-58" max="12" value={shoulder} onChange={(event) => { setPlaying(false); setShoulder(Number(event.target.value)); }} />
          </label>
          <label>
            <span><b>Elbow</b><output>{Math.round(elbow)}°</output></span>
            <input type="range" min="8" max="82" value={elbow} onChange={(event) => { setPlaying(false); setElbow(Number(event.target.value)); }} />
          </label>
          <label>
            <span><b>Wrist</b><output>{Math.round(wrist)}°</output></span>
            <input type="range" min="-42" max="36" value={wrist} onChange={(event) => { setPlaying(false); setWrist(Number(event.target.value)); }} />
          </label>

          <fieldset>
            <legend>Tool direction</legend>
            <div className="tool-options">
              {tools.map((item) => (
                <button key={item} type="button" data-active={tool === item} onClick={() => setTool(item)}>{item}</button>
              ))}
            </div>
          </fieldset>

          <button
            className="lab-preview-button"
            type="button"
            onClick={() => setPlaying((value) => !value)}
            disabled={reducedMotion}
            aria-pressed={playing}
          >
            {playing ? <Pause size={18} /> : <Play size={18} />}
            {reducedMotion ? "Preview disabled by motion preference" : playing ? "Pause preview" : "Preview motion"}
          </button>
          <p>Illustrative controls. Angles and tools do not represent confirmed hardware limits or interfaces.</p>
        </div>
      </div>
    </section>
  );
}
