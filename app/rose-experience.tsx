"use client";

import Lenis from "lenis";
import { ArrowDownRight, ArrowUpRight, Check, Menu, Moon, Sun, X } from "lucide-react";
import dynamic from "next/dynamic";
import { FormEvent, useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const RobotStage = dynamic(() => import("./robot-stage").then((module) => module.RobotStage), {
  ssr: false,
  loading: () => (
    <img
      className="robot-fallback"
      src="/concepts/robotic-arm-placeholder.png"
      alt="Concept rendering of the ROSE robotic arm"
    />
  ),
});

gsap.registerPlugin(ScrollTrigger);

type FormStatus = "idle" | "loading" | "success" | "error";

const navItems = [
  ["Robot", "#robot"],
  ["Capabilities", "#capabilities"],
  ["Applications", "#applications"],
  ["Developers", "#developers"],
  ["Company", "#company"],
];

export function RoseExperience() {
  const page = useRef<HTMLDivElement>(null);
  const story = useRef<HTMLElement>(null);
  const detailRail = useRef<HTMLElement>(null);
  const detailTrack = useRef<HTMLDivElement>(null);
  const pageProgress = useRef<HTMLElement>(null);
  const progress = useRef(0);
  const phase = useRef(0);
  const pointer = useRef({ x: 0, y: 0 });
  const [dark, setDark] = useState(false);
  const [themeReady, setThemeReady] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [storyVisible, setStoryVisible] = useState(true);
  const [storyPhase, setStoryPhase] = useState(0);
  const [formStatus, setFormStatus] = useState<FormStatus>("idle");
  const [formMessage, setFormMessage] = useState("");
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = window.localStorage.getItem("rose-theme");
    } catch {
      stored = null;
    }
    const useDark = stored ? stored === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
    setDark(useDark);
    setThemeReady(true);
    document.documentElement.dataset.theme = useDark ? "dark" : "light";
    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncMotionPreference = () => setReducedMotion(motionPreference.matches);
    syncMotionPreference();
    motionPreference.addEventListener("change", syncMotionPreference);
    return () => motionPreference.removeEventListener("change", syncMotionPreference);
  }, []);

  useEffect(() => {
    if (!themeReady) return;
    document.documentElement.dataset.theme = dark ? "dark" : "light";
    try {
      window.localStorage.setItem("rose-theme", dark ? "dark" : "light");
    } catch {
      // Theme still applies for the current visit when browser storage is unavailable.
    }
  }, [dark, themeReady]);

  useEffect(() => {
    if (!story.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => setStoryVisible(entry.isIntersecting),
      { rootMargin: "12% 0px" },
    );
    observer.observe(story.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!page.current || !story.current) return;

    const reduce = reducedMotion;
    const lenis = reduce ? null : new Lenis({ duration: 1.05, smoothWheel: true, wheelMultiplier: 0.88 });
    const tick = (time: number) => lenis?.raf(time * 1000);
    lenis?.on("scroll", ScrollTrigger.update);
    if (lenis) {
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
    }

    const media = gsap.matchMedia();
    const context = gsap.context(() => {
      ScrollTrigger.create({
        trigger: page.current,
        start: "top top",
        end: "bottom bottom",
        onUpdate: (self) => {
          if (pageProgress.current) gsap.set(pageProgress.current, { scaleX: self.progress });
        },
      });

      ScrollTrigger.create({
        trigger: story.current,
        start: "top top",
        end: "bottom bottom",
        onUpdate: (self) => {
          progress.current = reduce ? 0 : self.progress;
          const nextPhase = Math.min(3, Math.floor(self.progress * 4));
          if (nextPhase !== phase.current) {
            phase.current = nextPhase;
            setStoryPhase(nextPhase);
          }
        },
      });

      media.add("(min-width: 901px) and (prefers-reduced-motion: no-preference)", () => {
        if (!detailRail.current || !detailTrack.current) return;
        const distance = () => Math.max(0, detailTrack.current!.scrollWidth - window.innerWidth);
        gsap.to(detailTrack.current, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: detailRail.current,
            start: "top top",
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 0.9,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });
      });

      if (!reduce) {
        gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((element) => {
          gsap.fromTo(
            element,
            { opacity: 0.01, y: 28, filter: "blur(7px)" },
            {
              opacity: 1,
              y: 0,
              filter: "blur(0px)",
              duration: 0.82,
              ease: "power4.out",
              scrollTrigger: { trigger: element, start: "top 84%", once: true },
            },
          );
        });
      }
    }, page);

    ScrollTrigger.refresh();
    return () => {
      media.revert();
      context.revert();
      if (lenis) {
        gsap.ticker.remove(tick);
        lenis.destroy();
      }
    };
  }, [reducedMotion]);

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    pointer.current.x = event.clientX / window.innerWidth - 0.5;
    pointer.current.y = event.clientY / window.innerHeight - 0.5;
  }

  function closeMenu() {
    setMenuOpen(false);
  }

  function submitWaitlist(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (!valid) {
      setFormStatus("error");
      setFormMessage("Enter a valid email address.");
      return;
    }

    setFormStatus("loading");
    setFormMessage("Saving your place on this device.");
    window.setTimeout(() => {
      try {
        window.localStorage.setItem("rose-waitlist-email", email);
        setFormStatus("success");
        setFormMessage("Saved. Connect a production email service before launch.");
      } catch {
        setFormStatus("error");
        setFormMessage("This browser blocked local saving. Try again after enabling site storage.");
      }
    }, 650);
  }

  return (
    <div ref={page} className="rose-site" onPointerMove={handlePointerMove}>
      <a className="skip-link" href="#main-content">Skip to content</a>

      <header className="site-header" aria-label="Primary navigation">
        <span className="page-progress" aria-hidden="true"><i ref={pageProgress} /></span>
        <a className="brand" href="#robot" onClick={closeMenu} aria-label="ROSE home">
          <span className="brand-mark" aria-hidden="true"><i /><b /></span>
          <span>ROSE</span>
        </a>

        <nav className="desktop-nav" aria-label="Site sections">
          {navItems.map(([label, href]) => (
            <a key={href} href={href}>{label}</a>
          ))}
        </nav>

        <div className="header-actions">
          <button
            className="icon-button"
            type="button"
            onClick={() => setDark((value) => !value)}
            aria-label={dark ? "Use light mode" : "Use dark mode"}
          >
            {dark ? <Sun size={17} strokeWidth={1.8} /> : <Moon size={17} strokeWidth={1.8} />}
          </button>
          <a className="header-cta" href="#waitlist">Join the waitlist</a>
          <button
            className="menu-button"
            type="button"
            onClick={() => setMenuOpen((value) => !value)}
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav
          id="mobile-navigation"
          className="mobile-nav"
          data-open={menuOpen}
          aria-label="Mobile navigation"
          hidden={!menuOpen}
        >
          {navItems.map(([label, href]) => (
            <a key={href} href={href} onClick={closeMenu}>{label}<ArrowDownRight size={18} /></a>
          ))}
          <a href="#waitlist" onClick={closeMenu}>Join the waitlist<ArrowDownRight size={18} /></a>
        </nav>
      </header>

      <main id="main-content">
        <section ref={story} id="robot" className="robot-story" aria-label="ROSE robotic arm concept">
          <div className="robot-stage" data-phase={storyPhase} aria-hidden="true">
            <span className="stage-wordmark">ROSE</span>
            <RobotStage
              active={storyVisible}
              dark={dark}
              progress={progress}
              pointer={pointer}
              reducedMotion={reducedMotion}
            />
            <div className="orbit orbit-one" />
            <div className="orbit orbit-two" />
            <div className="kinematic-readout">
              <span>ROSE / CONCEPT MODEL</span>
              <strong>{["FULL FORM", "ARTICULATION", "JOINT STUDY", "SYSTEM VIEW"][storyPhase]}</strong>
              <i><b /></i>
              <small>{["Assembly", "Motion path", "Modular axis", "Platform direction"][storyPhase]}</small>
            </div>
            <div className="joint-marker marker-shoulder"><i /><span>Shoulder axis</span></div>
            <div className="joint-marker marker-wrist"><i /><span>Wrist interface</span></div>
            <div className="phase-rail" aria-hidden="true">
              {[0, 1, 2, 3].map((item) => <i key={item} data-active={item <= storyPhase} />)}
            </div>
            <div className="stage-scrim" />
            <p className="concept-disclosure">Procedural concept model. Final hardware may differ.</p>
          </div>

          <div className="story-copy">
            <article className="story-panel hero-panel">
              <div className="story-text hero-text">
                <h1>A new way to move work.</h1>
                <p>Meet ROSE, a robotic-arm concept built to make capable automation feel clear and approachable.</p>
                <div className="hero-actions">
                  <a className="primary-button" href="#capabilities">Explore ROSE<ArrowDownRight size={18} /></a>
                  <a className="text-link" href="#waitlist">Join the waitlist<ArrowUpRight size={17} /></a>
                </div>
              </div>
            </article>

            <article className="story-panel articulation-panel">
              <div className="story-text">
                <span className="section-kicker">Articulation concept</span>
                <h2>Motion you can read.</h2>
                <p>Every movement is shown through the structure that makes it possible.</p>
              </div>
            </article>

            <article className="story-panel joint-panel">
              <div className="story-text story-text-right">
                <h2>Designed from the joint out.</h2>
                <p>A modular architecture is the direction. Final hardware decisions remain open.</p>
              </div>
            </article>

            <article className="story-panel system-panel">
              <div className="story-text">
                <span className="section-kicker">Design intent</span>
                <h2>One arm. More than one future.</h2>
                <p>ROSE is being explored as a platform that can adapt as the product takes shape.</p>
              </div>
            </article>
          </div>
        </section>

        <section id="capabilities" className="content-section capabilities-section">
          <div className="section-heading" data-reveal>
            <h2>Capabilities, without guesswork.</h2>
            <p>The product story is ready to explore. Final engineering values remain open until they can be confirmed.</p>
          </div>

          <div className="capability-grid">
            <article className="capability-cell capability-reach" data-reveal>
              <div>
                <span className="cell-label">Working envelope</span>
                <h3>To be confirmed</h3>
                <p>Final reach and joint limits will replace this placeholder after engineering validation.</p>
              </div>
              <div className="reach-diagram" aria-hidden="true"><i /><i /><b /></div>
            </article>

            <article className="capability-cell capability-payload" data-reveal>
              <span className="cell-label">Payload</span>
              <h3>To be confirmed</h3>
              <p>No performance number is shown until it is real.</p>
            </article>

            <article className="capability-cell capability-mounting" data-reveal>
              <span className="cell-label">Mounting</span>
              <h3>Flexible by intent</h3>
              <p>Floor, bench, and mobile-base configurations are concept directions.</p>
            </article>

            <article className="capability-cell capability-tooling" data-reveal>
              <img src="/concepts/robotic-arm-placeholder.png" alt="Placeholder rendering of a robotic arm and gripper" />
              <div>
                <span className="cell-label">Tooling concept</span>
                <h3>Change the tool, not the arm.</h3>
                <p>Interchangeable end effectors are part of the concept. Interfaces and compatibility remain undecided.</p>
              </div>
            </article>
          </div>
          <p className="placeholder-notice">Capabilities and specifications in this section are concept placeholders.</p>
        </section>

        <section ref={detailRail} className="detail-rail" aria-label="ROSE system architecture concepts">
          <div ref={detailTrack} className="detail-track">
            <article className="detail-panel detail-joint-panel">
              <div className="detail-copy">
                <span className="section-kicker">Kinematic architecture</span>
                <h2>See the machine think in motion.</h2>
                <p>Joint intent, movement, and limits should be understandable before the arm moves.</p>
                <small>Interaction model concept. Final behavior remains under development.</small>
              </div>
              <div className="joint-study" aria-hidden="true">
                <span className="study-ring ring-outer" />
                <span className="study-ring ring-middle" />
                <span className="study-ring ring-inner" />
                <span className="study-arm study-arm-one" />
                <span className="study-arm study-arm-two" />
                <span className="study-node study-node-a" />
                <span className="study-node study-node-b" />
                <b>JOINT PATH / CONCEPT</b>
              </div>
            </article>

            <article className="detail-panel detail-tool-panel">
              <div className="detail-copy">
                <span className="section-kicker">Tool interface</span>
                <h2>One wrist. A growing vocabulary.</h2>
                <p>The product direction supports interchangeable tools without hiding their constraints.</p>
                <small>Tool shapes and interfaces shown here are placeholders.</small>
              </div>
              <div className="tool-study" aria-hidden="true">
                <div><i /><b /><span>GRIP</span></div>
                <div><i /><b /><span>PLACE</span></div>
                <div><i /><b /><span>MAKE</span></div>
              </div>
            </article>

            <article className="detail-panel detail-control-panel">
              <div className="detail-copy">
                <span className="section-kicker">Control loop</span>
                <h2>Preview first. Move with intent.</h2>
                <p>A clear sequence can connect planning, simulation, confirmation, and physical motion.</p>
                <small>Illustrative software flow. Not production behavior.</small>
              </div>
              <div className="control-loop" aria-hidden="true">
                <div><span>Plan</span><small>Motion recipe</small></div>
                <i />
                <div><span>Preview</span><small>Simulation</small></div>
                <i />
                <div><span>Confirm</span><small>Human intent</small></div>
                <i />
                <div><span>Move</span><small>Robot state</small></div>
              </div>
            </article>
          </div>
        </section>

        <section id="applications" className="content-section applications-section">
          <div className="section-heading narrow-heading" data-reveal>
            <h2>One object, different contexts.</h2>
            <p>These scenes show possible directions for ROSE. They are not deployment or customer claims.</p>
          </div>

          <div className="application-grid">
            <article className="application-main" data-reveal>
              <div className="application-image">
                <img src="/concepts/robotic-arm-placeholder.png" alt="Placeholder robotic arm in a neutral studio" />
              </div>
              <div className="application-copy">
                <span className="cell-label">Illustrative use case</span>
                <h3>Lab workflows</h3>
                <p>Explore repetitive handling, testing, and sample movement as a future product direction.</p>
              </div>
            </article>

            <div className="application-stack">
              <article className="application-secondary application-production" data-reveal>
                <span className="cell-label">Illustrative use case</span>
                <h3>Small-batch production</h3>
                <p>A concept for tending fixtures and repeatable workflows.</p>
              </article>
              <article className="application-secondary application-creative" data-reveal>
                <span className="cell-label">Illustrative use case</span>
                <h3>Creative fabrication</h3>
                <p>A concept for tools, material studies, and physical prototyping.</p>
              </article>
            </div>
          </div>
        </section>

        <section id="developers" className="content-section developer-section">
          <div className="developer-copy" data-reveal>
            <span className="section-kicker">Software concept</span>
            <h2>Hardware is only half the system.</h2>
            <p>Control software is part of the direction. The API, tools, and safety model are still being defined.</p>
            <div className="concept-list">
              <span>Simulation-first workflows</span>
              <span>Reusable motion recipes</span>
              <span>Observable robot state</span>
            </div>
          </div>

          <div className="code-concept" data-reveal>
            <div className="code-heading">
              <span>Illustrative API concept</span>
              <span>Not production code</span>
            </div>
            <pre aria-label="Illustrative ROSE API example"><code><span>const</span> rose = <span>await</span> connect({`{`}{"\n"}  mode: <em>"simulation"</em>{"\n"}{`}`});{"\n\n"}<span>await</span> rose.preview({`{`}{"\n"}  motion: conceptRecipe,{"\n"}  confirm: <strong>true</strong>{"\n"}{`}`});</code></pre>
          </div>
        </section>

        <section className="content-section specifications-section">
          <div className="section-heading" data-reveal>
            <h2>The details are still being engineered.</h2>
            <p>Every open value is shown as open. Confirmed specifications will replace these placeholders before launch.</p>
          </div>

          <div className="spec-groups">
            <article data-reveal>
              <h3>Mechanical</h3>
              <dl>
                <div><dt>Reach</dt><dd>To be confirmed</dd></div>
                <div><dt>Payload</dt><dd>To be confirmed</dd></div>
                <div><dt>Repeatability</dt><dd>To be confirmed</dd></div>
              </dl>
            </article>
            <article data-reveal>
              <h3>Integration</h3>
              <dl>
                <div><dt>Power</dt><dd>To be confirmed</dd></div>
                <div><dt>Networking</dt><dd>To be confirmed</dd></div>
                <div><dt>Mounting</dt><dd>Concept in progress</dd></div>
              </dl>
            </article>
            <article data-reveal>
              <h3>Safety</h3>
              <dl>
                <div><dt>Certification</dt><dd>Not yet established</dd></div>
                <div><dt>Rated modes</dt><dd>To be confirmed</dd></div>
                <div><dt>Environment</dt><dd>To be confirmed</dd></div>
              </dl>
            </article>
          </div>
        </section>

        <section id="company" className="content-section company-section">
          <div className="company-visual" data-reveal>
            <img src="/concepts/robotic-arm-placeholder.png" alt="ROSE robotic arm concept placeholder" />
          </div>
          <div className="company-copy" data-reveal>
            <span className="section-kicker">Draft brand statement</span>
            <h2>Make capable robotics understandable.</h2>
            <p>ROSE begins with a simple belief: people should be able to see how a machine moves, what it knows, and where its limits are.</p>
            <p className="draft-note">Replace this section with the confirmed founder story, team, location, and company details before launch.</p>
          </div>
        </section>

        <section id="waitlist" className="waitlist-section">
          <div className="waitlist-inner" data-reveal>
            <span className="section-kicker">Follow the build</span>
            <h2>See ROSE take shape.</h2>
            <p>Join for product updates, new concept work, and confirmed details as they become available.</p>

            {formStatus === "success" ? (
              <div className="success-state" role="status">
                <Check size={22} strokeWidth={1.8} />
                <div><strong>You are saved locally.</strong><span>{formMessage}</span></div>
              </div>
            ) : (
              <form className="waitlist-form" onSubmit={submitWaitlist} noValidate>
                <label htmlFor="waitlist-email">Email address</label>
                <div className="form-row">
                  <input
                    id="waitlist-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    aria-describedby="waitlist-help waitlist-message"
                    aria-invalid={formStatus === "error"}
                    disabled={formStatus === "loading"}
                  />
                  <button type="submit" disabled={formStatus === "loading"}>
                    {formStatus === "loading" ? "Saving" : "Join the waitlist"}
                  </button>
                </div>
                <p id="waitlist-message" className="form-message" data-error={formStatus === "error"} aria-live="polite">{formMessage}</p>
                <p id="waitlist-help" className="form-help">Prototype form. No email leaves this device until a production service is connected.</p>
              </form>
            )}
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="footer-brand"><span className="brand-mark" aria-hidden="true"><i /><b /></span><span>ROSE</span></div>
        <nav aria-label="Footer navigation">
          {navItems.map(([label, href]) => <a key={href} href={href}>{label}</a>)}
        </nav>
        <p>Concept website. Product details and imagery remain provisional.</p>
      </footer>
    </div>
  );
}
