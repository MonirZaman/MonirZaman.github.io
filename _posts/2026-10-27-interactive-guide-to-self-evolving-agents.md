---
layout: post
title: "Interactive Guide to Self-Evolving Agents"
permalink: /interactive-guide-to-self-evolving-agents/
date: 2026-10-27
description: "A deployed agent stops learning the day it ships. This interactive guide follows one coding agent through ten problems, from checking its own work to rewriting its own improver, with the 2026 research that solves each one."
excerpt: "A deployed agent stops learning the day it ships: it repeats its mistakes, the work drifts, and human tuning is slow. This interactive guide follows one coding agent through ten problems, from checking its own work to rewriting its own improver, and shows why every step depends on one thing: the verifier."
tags: [agents, self-improvement, self-evolving-agents, harness, recursive-self-improvement, verifier]
---

<style>
  /* Jekyll Now leaves tables unstyled; scoped to posts so other pages are untouched */
  .entry table { border-collapse: collapse; font-size: 15px; margin: 1em 0; }
  .entry th, .entry td { border: 1px solid #ddd; padding: 6px 10px; text-align: left; vertical-align: top; }
  .entry th { background: #f6f8fa; }
  .entry .tbl-wide table { min-width: 600px; }
  .entry details { margin: .6em 0; } .entry summary { cursor: pointer; }
  .entry .fig-cap { font-size: .85em; color: #666; margin-top: -.4em; }

  /* Reading typography for this post only (other posts keep the site theme) */
  .post h1, .post .entry { font-family: "Iowan Old Style", Charter, "Source Serif 4", "Source Serif Pro", Georgia, Cambria, "Times New Roman", serif; }
  .post h1 { font-weight: 600; letter-spacing: -.01em; line-height: 1.25; }
  .post .entry { font-size: 18.5px; line-height: 1.68; color: #1f2328; }
  .post .entry h2, .post .entry h3 { font-family: inherit; font-weight: 600; margin-top: 1.8em; scroll-margin-top: 16px; }
  .post .entry table, .post .entry summary, .post .entry .fig-cap { font-family: -apple-system, "Segoe UI", Helvetica, Arial, sans-serif; }
  .post .entry .fig-cap { font-size: 14px; line-height: 1.5; }
  .post .entry code { font-size: .82em; }
  .post .entry a { overflow-wrap: anywhere; }
  .post .entry blockquote { border-left: 3px solid #d0d7de; margin: 1.2em 0; padding: .1em 0 .1em 1em; color: #424a53; font-style: italic; }
  @media (max-width: 640px) { .post h1 { font-size: 28px; } .post .entry { font-size: 17px; line-height: 1.65; } }

  /* Pull-quote for the thesis, and the formula / worked-example boxes */
  .thesis { font-size: 1.18em; line-height: 1.5; border-top: 1px solid #d0d7de; border-bottom: 1px solid #d0d7de; padding: .8em 0; margin: 1.6em 0; }
  .formula { font: 15px/1.5 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; background: #f6f8fa; border: 1px solid #d0d7de; border-radius: 8px; padding: 10px 14px; overflow-x: auto; white-space: nowrap; margin: 1em 0; }
  .worked { background: #f6f5f4; border: 1px solid #e3e1de; border-radius: 10px; padding: 12px 16px; margin: 1.2em 0; font-size: .95em; }
  .worked b:first-child { font-family: -apple-system, "Segoe UI", Helvetica, Arial, sans-serif; font-size: 13px; letter-spacing: .05em; text-transform: uppercase; color: #59636e; }

  /* Contents card */
  .entry #markdown-toc { list-style: none; background: #f6f5f4; border: 1px solid #e3e1de; border-radius: 10px;
    padding: 14px 22px; margin: 1.6em 0; font-size: 16px; line-height: 1.65; }
  .entry #markdown-toc::before { content: "Contents"; display: block; font-weight: 700; margin-bottom: 4px; }
  .entry #markdown-toc ul { list-style: none; padding-left: 1.2em; margin: 0; }
  .entry #markdown-toc a { text-decoration: none; }

  /* Heading links, enlargeable figures, citation box, reading progress, reveal-on-scroll */
  .hd-anchor { margin-right: .35em; color: #0969da; opacity: .45; text-decoration: none; font-weight: 400; }
  h2:hover > .hd-anchor, h3:hover > .hd-anchor, .hd-anchor:focus { opacity: 1; }
  .entry img.zoomable { cursor: zoom-in; }
  .lightbox { position: fixed; inset: 0; z-index: 1000; background: rgba(255,255,255,.99); display: flex; align-items: center; justify-content: center; padding: 3vh 2vw; cursor: zoom-out; }
  .lightbox[hidden] { display: none; }
  .lightbox img { max-width: 96vw; max-height: 92vh; width: 96vw; height: auto; }
  .lightbox .lb-close { position: absolute; top: 10px; right: 16px; font-size: 30px; line-height: 1; background: none; border: 0; color: #59636e; cursor: pointer; }
  .cite { background: #f6f8fa; border: 1px solid #d0d7de; border-radius: 10px; padding: 12px 14px 4px; margin: 1em 0 2em; }
  .cite pre { background: #fff; font: 12.5px/1.5 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; overflow-x: auto; margin: 8px 0 10px; }
  .cite button { font: 14px -apple-system, "Segoe UI", Helvetica, Arial, sans-serif; padding: 3px 12px; border-radius: 6px; border: 1px solid #d0d7de; background: #fff; cursor: pointer; }
  .read-progress { position: fixed; top: 0; left: 0; height: 3px; width: 100%; background: #0969da; transform-origin: 0 50%; transform: scaleX(0); z-index: 999; pointer-events: none; }
  .js-reveal { opacity: 0; transform: translateY(14px); transition: opacity .6s ease, transform .6s ease; }
  .js-reveal.is-in { opacity: 1; transform: none; }
  @media (prefers-reduced-motion: reduce) { .js-reveal { opacity: 1; transform: none; transition: none; } }

  /* Tutorial figures and layout, scoped to this post */
.sea{
  --bg:#F4F5F2; --surface:#FFFFFF; --ink:#16201E; --muted:#56635F; --line:#D8DED9; --tint:#E6EFEC;
  --keep:#0E7C6B; --reject:#B4482B; --state:#6A4BB0; --prop:#4B6378; --warn:#9A6A00;
  --f-display:inherit;
  --f-body:-apple-system,"Segoe UI",Helvetica,Arial,sans-serif;
  --f-mono:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;
}
@media (prefers-reduced-motion: reduce){.sea *{transition:none!important;animation:none!important}}
.sea{margin:0}
@media (max-width:520px){.sea{padding-inline:16px}}
.sea h1{font-family:var(--f-display);font-weight:600;font-size:clamp(32px,5.4vw,48px);line-height:1.08;letter-spacing:-.015em;margin:8px 0 14px;text-wrap:balance}
.sea h2{font-family:var(--f-display);font-weight:600;font-size:28px;line-height:1.15;margin:0 0 10px;text-wrap:balance}
.sea h3{font-family:var(--f-display);font-weight:500;font-size:20px;margin:26px 0 8px}
.sea p{margin:0 0 14px;max-width:68ch}
.sea a{color:var(--keep)}
.sea .kicker{font-family:var(--f-mono);font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:var(--muted)}
.sea .lede{font-size:18.5px;color:var(--muted)}
.sea .chap{margin-top:64px;padding-top:28px;border-top:1px solid var(--line);scroll-margin-top:12px}
.sea .k{font-weight:600}
.sea .k-keep{color:var(--keep)}
.sea .k-rej{color:var(--reject)}
.sea .k-state{color:var(--state)}
.sea .k-prop{color:var(--prop)}
.sea code,.sea .mono{font-family:var(--f-mono);font-size:.88em}
.sea code{background:var(--tint);padding:1px 5px;border-radius:4px}
.sea .oneline{border-left:3px solid var(--keep);background:var(--surface);padding:10px 14px;border-radius:0 8px 8px 0;margin:16px 0}
.sea .oneline b{font-family:var(--f-mono);font-size:11.5px;letter-spacing:.06em;text-transform:uppercase;color:var(--keep);display:block;margin-bottom:2px}
.sea .example{background:var(--tint);border-radius:10px;padding:12px 16px;margin:16px 0}
.sea .example b.lab{font-family:var(--f-mono);font-size:11.5px;letter-spacing:.06em;text-transform:uppercase;color:var(--muted);display:block;margin-bottom:4px}
.sea .paper{border:1px solid var(--line);background:var(--surface);border-radius:10px;padding:12px 16px;margin:12px 0}
.sea .paper .meta{font-family:var(--f-mono);font-size:11.5px;color:var(--state);margin-bottom:2px}
.sea .paper .t{font-weight:600}
.sea .paper p{margin:6px 0 0;font-size:15px}
.sea ul.plain{margin:0 0 14px;padding-left:20px}
.sea ul.plain li{margin-bottom:6px;max-width:66ch}
.sea .toc{display:flex;flex-wrap:wrap;gap:6px 14px;font-size:14px;margin:18px 0 0;padding:12px 14px;border:1px solid var(--line);border-radius:10px;background:var(--surface)}
.sea .toc a{color:var(--ink);text-decoration:none}
.sea .toc a:hover{color:var(--keep)}
.sea .toc span{font-family:var(--f-mono);color:var(--muted);margin-right:4px}
.sea .bench{background:var(--surface);border:1px solid var(--line);border-radius:14px;padding:16px;margin:18px 0 10px;display:flex;flex-direction:column;gap:12px}
.sea .bh{display:flex;justify-content:space-between;align-items:baseline;gap:10px;flex-wrap:wrap}
.sea .bh b{font-family:var(--f-display);font-weight:500;font-size:17px}
.sea .bh span{font-size:12.5px;color:var(--muted)}
.sea .ctrls{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:10px 18px}
.sea .ctrl{display:flex;flex-direction:column;gap:3px;min-width:0}
.sea .ctrl .r{display:flex;justify-content:space-between;gap:8px;font-size:13.5px}
.sea .ctrl output{font-family:var(--f-mono);font-size:13px}
.sea input[type=range]{width:100%;accent-color:var(--keep)}
.sea .btns{display:flex;gap:8px;flex-wrap:wrap}
.sea button{font:inherit;font-size:14px;font-weight:500;padding:6px 13px;border-radius:7px;border:1px solid var(--line);background:var(--bg);color:var(--ink);cursor:pointer}
.sea button:hover{border-color:var(--muted)}
.sea button.pri{background:var(--ink);color:var(--bg);border-color:var(--ink)}
.sea button:disabled{opacity:.45;cursor:default}
.sea button:focus-visible,.sea input:focus-visible,.sea select:focus-visible,.sea a:focus-visible{outline:2px solid var(--keep);outline-offset:2px}
.sea .seg{display:inline-flex;flex-wrap:wrap;border:1px solid var(--line);border-radius:7px;overflow:hidden;align-self:flex-start}
.sea .seg button{border:0;border-radius:0;border-right:1px solid var(--line)}
.sea .seg button:last-child{border-right:0}
.sea .seg button[aria-pressed="true"]{background:var(--ink);color:var(--bg)}
.sea .ro{display:flex;flex-wrap:wrap;gap:1px;background:var(--line);border:1px solid var(--line);border-radius:8px;overflow:hidden}
.sea .ro div{flex:1 1 140px;background:var(--surface);padding:8px 11px;min-width:0}
.sea .ro b{display:block;font-family:var(--f-mono);font-size:18px;font-weight:600;line-height:1.25}
.sea .ro span{font-size:12px;color:var(--muted)}
.sea .cap{font-size:13.5px;color:var(--muted);margin:0;line-height:1.5}
.sea .chart{width:100%;height:auto;display:block}
.sea .chart text{font-family:var(--f-mono);font-size:10.5px;fill:var(--muted)}
.sea .key{display:flex;flex-wrap:wrap;gap:12px;font-size:12.5px;color:var(--muted)}
.sea .key i{display:inline-block;width:10px;height:10px;border-radius:2px;margin-right:5px;vertical-align:-1px}
.sea .loop{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;position:relative}
@media (max-width:600px){.sea .loop{grid-template-columns:1fr 1fr}}
.sea .node{border:1.5px solid var(--line);border-radius:10px;padding:10px;background:var(--bg);min-width:0;transition:border-color .25s}
.sea .node .n{font-family:var(--f-mono);font-size:11px;letter-spacing:.06em;text-transform:uppercase}
.sea .node p{margin:4px 0 0;font-size:13.5px;line-height:1.45}
.sea .node.n1 .n{color:var(--prop)}
.sea .node.n2 .n{color:var(--prop)}
.sea .node.n3 .n{color:var(--keep)}
.sea .node.n4 .n{color:var(--state)}
.sea .node.n3{border-color:var(--keep)}
.sea .node.n4{border-color:var(--state)}
.sea .chips{display:flex;flex-wrap:wrap;gap:6px}
.sea .chip{font-size:13px;padding:4px 10px;border-radius:999px;border:1px solid var(--line);background:var(--bg);cursor:pointer;color:var(--ink)}
.sea .chip[aria-pressed="true"]{background:var(--ink);color:var(--bg);border-color:var(--ink)}
.sea .tag{display:inline-block;font-family:var(--f-mono);font-size:11.5px;padding:2px 8px;border-radius:999px;border:1px solid var(--line);margin-right:6px}
.sea .trace{display:flex;flex-direction:column;gap:6px}
.sea .ev{display:grid;grid-template-columns:76px minmax(0,1fr);gap:10px;font-size:14px;align-items:start;transition:opacity .3s}
.sea .ev .w{font-family:var(--f-mono);font-size:11.5px;color:var(--muted);padding-top:2px}
.sea .ev.dim{opacity:.35}
.sea .state{border:1.5px solid var(--state);border-radius:10px;padding:10px 12px;font-size:13.5px}
.sea .state h4{margin:0 0 4px;font-family:var(--f-mono);font-size:11.5px;letter-spacing:.06em;text-transform:uppercase;color:var(--state)}
.sea .state ul{margin:0;padding-left:18px}
.sea .conf{height:10px;border-radius:5px;background:var(--line);overflow:hidden;position:relative}
.sea .conf i{position:absolute;left:0;top:0;bottom:0;transition:width .4s}
.sea .conf s{position:absolute;top:-3px;bottom:-3px;width:2px;background:var(--ink)}
.sea .cols{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:12px}
@media (max-width:600px){.sea .cols{grid-template-columns:1fr}}
.sea .col{border:1px solid var(--line);border-radius:10px;padding:10px;background:var(--bg);min-width:0}
.sea .col h4{margin:0 0 6px;font-size:14px}
.sea .note{font-size:13px;padding:5px 8px;border-radius:6px;border:1px solid var(--line);background:var(--surface);margin-bottom:5px}
.sea .note.used{border-color:var(--state)}
.sea .note.rev{border-color:var(--keep);box-shadow:inset 3px 0 0 var(--keep)}
.sea .res{font-family:var(--f-mono);font-size:12.5px;margin:6px 0}
.sea .ok{color:var(--keep)}
.sea .bad{color:var(--reject)}
.sea .stream{display:flex;gap:6px;flex-wrap:wrap}
.sea .task{font-family:var(--f-mono);font-size:12px;padding:3px 8px;border-radius:6px;border:1px solid var(--line)}
.sea .task.cur{background:var(--ink);color:var(--bg);border-color:var(--ink)}
.sea .dots{display:flex;gap:5px;flex-wrap:wrap}
.sea .dot{width:16px;height:16px;border-radius:50%}
.sea table.cmp{width:100%;border-collapse:collapse;font-size:14px}
.sea table.cmp th,.sea table.cmp td{text-align:left;padding:8px 9px;border-bottom:1px solid var(--line);vertical-align:top}
.sea table.cmp th{font-size:11px;text-transform:uppercase;letter-spacing:.07em;color:var(--muted);font-weight:600}
.sea .scroll{overflow-x:auto}
.sea .refs li{margin-bottom:6px;font-size:14.5px;max-width:none}
.sea .ladder{display:flex;flex-direction:column;gap:4px}
.sea .rung{display:grid;grid-template-columns:44px minmax(0,1fr);gap:10px;align-items:baseline;font-size:14.5px}
.sea .rung b{font-family:var(--f-mono);color:var(--state)}
.sea .harness-card{font-family:var(--f-mono);font-size:13px;line-height:1.55;background:var(--surface);border:1px solid var(--line);border-left:3px solid var(--state);border-radius:0 10px 10px 0;padding:10px 14px;margin:14px 0;white-space:pre-wrap;overflow-wrap:anywhere}
.sea .harness-card b{color:var(--state);font-weight:600}
.sea .problem{background:var(--surface);border:1px solid var(--line);border-radius:10px;padding:10px 14px;margin:6px 0 16px}
.sea .problem b.lab{font-family:var(--f-mono);font-size:11.5px;letter-spacing:.06em;text-transform:uppercase;color:var(--reject);display:block;margin-bottom:2px}
.sea .sofar{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:1px;background:var(--line);border:1px solid var(--line);border-radius:10px;overflow:hidden;margin:18px 0 0;font-size:14px}
@media (max-width:600px){.sea .sofar{grid-template-columns:1fr}}
.sea .sofar>div{background:var(--surface);padding:10px 14px;min-width:0}
.sea .sofar h4{margin:0 0 4px;font-family:var(--f-mono);font-size:11.5px;letter-spacing:.06em;text-transform:uppercase}
.sea .sofar .has h4{color:var(--keep)}
.sea .sofar .gap h4{color:var(--reject)}
.sea .sofar ul{margin:0;padding-left:18px}
.sea .sofar li{margin-bottom:3px}
.sea .sofar .new{font-weight:600}
.sea .arch{display:flex;flex-direction:column;gap:8px}
.sea .arch .row{display:grid;grid-template-columns:minmax(0,.8fr) 18px minmax(0,2fr) 18px minmax(0,.8fr) 18px minmax(0,.9fr);align-items:stretch;gap:4px}
.sea .arch .arr{display:flex;align-items:center;justify-content:center;color:var(--muted);font-family:var(--f-mono)}
.sea .blk{border:1.5px solid var(--line);border-radius:9px;padding:8px 9px;background:var(--bg);font-size:13.5px;font-weight:500;min-width:0;transition:border-color .25s,background .25s,box-shadow .25s}
.sea .blk small{display:block;font-weight:400;font-size:12px;color:var(--muted);line-height:1.35;margin-top:2px}
.sea .agent{border:1.5px dashed var(--line);border-radius:11px;padding:7px;display:flex;flex-direction:column;gap:6px;min-width:0}
.sea .agent>.lab,.sea .harness>.lab{font-family:var(--f-mono);font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:var(--muted)}
.sea .harness{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:5px;border-radius:9px;padding:6px;background:var(--tint)}
.sea .harness>.lab{grid-column:1/-1}
.sea .harness .blk{padding:5px 8px;font-size:13px}
.sea .blk.chg{border-color:var(--keep);background:color-mix(in srgb,var(--keep) 14%,var(--surface));box-shadow:0 0 0 2px color-mix(in srgb,var(--keep) 25%,transparent)}
.sea .blk.jdg{border-color:var(--state);background:color-mix(in srgb,var(--state) 12%,var(--surface))}
.sea .blk.chg.jdg{border-color:var(--keep);box-shadow:inset 0 0 0 2px var(--state)}
.sea .arch .imp{text-align:center}
@media (max-width:640px){.sea .arch .row{grid-template-columns:1fr}
.sea .arch .arr{transform:rotate(90deg);height:14px}}
.sea .mapro{display:grid;grid-template-columns:110px minmax(0,1fr);gap:4px 12px;font-size:14px}
.sea .mapro dt{font-family:var(--f-mono);font-size:11.5px;letter-spacing:.05em;text-transform:uppercase;color:var(--muted);padding-top:2px}
.sea .mapro dd{margin:0}
@media (max-width:480px){.sea .mapro{grid-template-columns:1fr}
.sea .mapro dd{margin-bottom:6px}}
.sea .cands{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}
@media (max-width:640px){.sea .cands{grid-template-columns:1fr}}
.sea .cand{border:1.5px solid var(--line);border-radius:10px;padding:9px 10px;background:var(--bg);font-size:13.5px;min-width:0;transition:border-color .3s,opacity .3s}
.sea .cand h4{margin:0 0 3px;font-size:13.5px}
.sea .cand .edit{color:var(--muted);font-size:13px;margin-bottom:6px}
.sea .cand ul{margin:0;padding-left:16px}
.sea .cand li{margin-bottom:3px}
.sea .cand.win{border-color:var(--keep)}
.sea .cand.lose{border-color:var(--reject);opacity:.7}
.sea .ev-good{color:var(--keep);font-weight:600}
.sea .ev-bad{color:var(--reject);font-weight:600}
.sea .composed{border:1.5px solid var(--state);border-radius:10px;padding:9px 12px;font-size:13.5px}
.sea .composed h4{margin:0 0 4px;font-family:var(--f-mono);font-size:11.5px;letter-spacing:.06em;text-transform:uppercase;color:var(--state)}
.sea .stepper{display:flex;gap:6px;flex-wrap:wrap;font-family:var(--f-mono);font-size:12px}
.sea .stepper span{padding:3px 8px;border-radius:999px;border:1px solid var(--line);color:var(--muted)}
.sea .stepper span.on{background:var(--ink);color:var(--bg);border-color:var(--ink)}
.sea .stepper span.done{color:var(--ink)}
.sea .gloss{display:grid;grid-template-columns:180px minmax(0,1fr);gap:6px 14px;font-size:14.5px;margin:0 0 18px}
.sea .gloss dt{font-weight:600}
.sea .gloss dd{margin:0;color:var(--ink)}
@media (max-width:520px){.sea .gloss{grid-template-columns:1fr;gap:2px}
.sea .gloss dd{margin-bottom:8px}}
.sea tr.winrow td{background:color-mix(in srgb,var(--keep) 12%,var(--surface))}
.sea svg.dg{width:100%;height:auto;display:block;overflow:visible}
.sea svg.dg text{font-family:var(--f-body);font-size:12.5px;fill:var(--ink)}
.sea svg.dg text.lab{font-weight:600;font-size:13px}
.sea svg.dg text.sub{fill:var(--muted);font-size:11.5px}
.sea svg.dg text.body{font-size:12.5px}
.sea svg.dg text.mono{font-family:var(--f-mono);font-size:10.5px;letter-spacing:.05em;fill:var(--muted)}
.sea{background:transparent;color:var(--ink)}
.sea .bench,.sea .paper,.sea .problem,.sea .sofar,.sea .oneline,.sea .example,.sea .toc,.sea table.cmp,.sea .gloss,.sea .ladder{font-family:var(--f-body);font-size:15px;line-height:1.55}
.sea .bench p,.sea .paper p{max-width:none}
.sea p{max-width:none}
.sea h2{font-size:30px;margin:0 0 10px}
.sea .chap{margin-top:56px}
.sea a.cite-n{text-decoration:none;white-space:nowrap}
.sea img{max-width:100%}

</style>

{% assign A = "/assets/posts/self-evolving-agents" | relative_url %}

<div class="sea" markdown="0">
<p class="lede">Follow one coding agent through nine problems, and the recent papers that solve each one, until it is rewriting the process that improves it.</p>
<div class="toc" role="navigation" aria-label="Contents">
<a href="#start"><span>0</span>The setup</a><a href="#p1"><span>1</span>Checking its work</a><a href="#p2"><span>2</span>Refine or restart</a><a href="#p3"><span>3</span>Memory</a><a href="#p4"><span>4</span>The whole harness</a><a href="#p5"><span>5</span>Trade-offs</a><a href="#p6"><span>6</span>The weights</a><a href="#p7"><span>7</span>Practice tasks</a><a href="#p8"><span>8</span>The improver</a><a href="#p9"><span>9</span>The judge</a><a href="#prod"><span>10</span>In production</a><a href="#recap"><span>11</span>Recap</a><a href="#refs"><span>12</span>Sources</a>
</div>
<!-- 0 -->
<section class="chap" id="start">
<div class="kicker">0 · The setup</div>
<h2>Meet Patch</h2>
<p>Patch is a coding agent at a small (made-up) software company. Every day it picks up bug tickets, edits the code, runs the tests and opens a pull request. Patch is two things put together:</p>
<ul class="plain">
<li>A <b>model</b>: a large language model whose weights are fixed. It reads text and writes text.</li>
<li>A <b>harness</b>: everything around the model that turns it into a worker. The instructions it is given, the tools it may call, any memory it keeps between tickets, and the workflow that decides what happens in what order.</li>
</ul>
<p>I wrote earlier about why the harness matters, in <a href="{% post_url 2026-04-20-Engineering-the-Glue-The-Rise-of-Autonomous-Harness-Engineering %}">Engineering the Glue</a>. This is Patch's harness on day one. Most of what follows is about what gets added to it and, toward the end, what lies beyond it:</p>
<div class="harness-card"><b>prompt</b>    You are Patch. Fix the bug described in the ticket.
<b>tools</b>     shell · read_file · edit_file · run_tests
<b>memory</b>    (empty)
<b>workflow</b>  read ticket → edit code → run tests → open PR</div>
<h3>The problem: a deployed agent stops learning</h3>
<p>Patch does fine on day one. The trouble starts on day two, and it is the same trouble every deployed agent runs into:</p>
<ul class="plain">
<li><b>It repeats its mistakes.</b> Nothing about Patch changes after a failure, so the same kind of ticket fails again tomorrow.</li>
<li><b>The work keeps changing.</b> New repos, new tools and new kinds of request bring failures nobody has seen yet.</li>
<li><b>Human tuning is slow.</b> The usual fix is an engineer reading failure logs and hand-editing prompts and tools. That happens in batches, a few problems at a time, while the tickets keep coming.</li>
</ul>
<p>A <b>self-evolving</b> agent goes after all three at once: it learns from each failure as it happens and keeps what it learns. To see what that buys, the figure feeds the same month of tickets to three versions of Patch. Press play first. Then flip the weak-verifier switch and watch the same idea backfire.</p>
<div class="bench" id="w-why">
  <div class="bh"><b>A month of tickets, three ways to run Patch</b><span>toy model</span></div>
  <div class="ctrls">
    <div class="ctrl"><div class="r"><label for="wD">Show tickets up to</label><output></output></div><input id="wD" type="range" min="0" max="30" step="1" value="30"></div>
    <div class="ctrl" style="gap:8px;font-size:13.5px;justify-content:flex-end">
      <label style="display:flex;gap:6px;align-items:center;cursor:pointer"><input type="checkbox" class="badv"> the self-evolving loop uses a weak verifier</label>
    </div>
  </div>
  <div class="btns"><button class="bplay pri">Play the month</button></div>
  <svg class="dg lanes" viewBox="0 0 680 180" role="img" aria-label="Sixty tickets per lane, fixed or failed, for a frozen agent, weekly human tuning and a self-evolving agent"></svg>
  <div class="key"><span><i style="background:var(--keep)"></i>ticket fixed</span><span><i style="background:var(--reject)"></i>ticket failed</span><span><svg width="11" height="9" aria-hidden="true" style="margin-right:5px"><path d="M0,0 L11,0 L5.5,9z" fill="var(--state)"/></svg>change kept (lesson learned, or engineer fix)</span><span><svg width="11" height="9" aria-hidden="true" style="margin-right:5px"><path d="M0,0 L11,0 L5.5,9z" fill="var(--reject)"/></svg>wrong lesson kept</span></div>
  <svg class="chart trend" viewBox="0 0 640 220" role="img" aria-label="Rolling share of tickets fixed for each lane"></svg>
  <div class="key"><span><i style="background:var(--muted)"></i>frozen (dashed)</span><span><i style="background:var(--prop)"></i>engineer tunes weekly</span><span><i style="background:var(--keep)"></i>self-evolving</span></div>
  <div class="ro"><div><b class="v1"></b><span>frozen: fixed, last 7 days</span></div><div><b class="v2"></b><span>weekly tuning: fixed, last 7 days</span></div><div><b class="v3"></b><span>self-evolving: fixed, last 7 days</span></div><div><b class="v4"></b><span>failures on known problem types (frozen · weekly · self)</span></div></div>
  <p class="cap wc"></p>
</div>
<p>Everything else in this post grows out of those two runs. Learning from <em>every</em> failure, quickly, beats both standing still and waiting for an engineer, especially when the work shifts underneath you. But the loop is only as good as the check that decides which lessons to keep. With a sloppy check, it makes Patch worse than not learning at all.</p>
<h3>The loop</h3>
<p>The cleanest definition I know comes from a September 2026 position paper, <em>The Last AI Built by Humans</em> [<a class="cite-n" href="https://arxiv.org/abs/2609.11873" title="The Last AI Built by Humans: Toward Genuine Recursive Self-Improvement" target="_blank" rel="noopener">1</a>]. In its framing, self-improvement is a loop with four parts: <span class="k k-prop">experience</span> suggests a <span class="k k-prop">change</span>, a <span class="k k-keep">verifier</span> decides whether it is actually better, and accepted changes become <span class="k k-state">kept state</span> used in later rounds. This is one turn of it in Patch's world:</p>
<div class="bench" id="w-cycle">
  <div class="bh"><b>One turn of the self-improvement loop</b><span>Patch, ticket 12</span></div>
  <svg class="dg" viewBox="0 0 680 220" role="img" aria-label="Experience suggests a proposed change, which is tested by a verifier; accepted changes become kept state that shapes the next attempt; rejected changes are discarded"></svg>
</div>
<p>The last step is what separates improvement from mere <em>refinement</em>. If Patch rewrites one fix and then forgets how, the fix got better but Patch did not.</p>
<h3>The road ahead</h3>
<p>From here, Patch runs into nine problems in a row, and then we look at a real team running the same loop in production. Each problem is where the previous fix breaks down, and each new fix comes from a recent paper. For each problem, the map shows which part of Patch gets edited (teal) and what decides whether the edit stays (violet). Keep an eye on the violet box. It changes at every step, and that is what this post is really about.</p>
<div class="bench" id="w-map">
  <div class="bh"><b>What changes at each step of self-evolve</b><span>pick a problem or step through</span></div>
  <div class="chips" role="group" aria-label="Problems"></div>
  <svg class="dg" viewBox="0 0 680 330" role="img" aria-label="Patch's architecture: tasks feed the harness and model, which write an attempt judged by a verifier; the improver receives the verdict and edits the highlighted part"></svg>
  <dl class="mapro"><dt>Problem</dt><dd class="m1"></dd><dt>Idea</dt><dd class="m2"></dd></dl>
  <div class="btns"><button class="bprev">Previous</button><button class="bnext pri">Next problem</button></div>
</div>
<p>The route has a direction. Early fixes touch a single attempt and are gone in minutes. Later ones reach into the harness, then the weights, then the machinery of improvement itself. Each step buys changes that last longer, and makes it harder to be sure they were good ones.</p>
</section>
<!-- 1 -->
<section class="chap" id="p1">
<div class="kicker">Problem 1 · Checking its own work</div>
<h2>"Are you sure?" is not a verifier</h2>
<div class="problem"><b class="lab">The problem</b>Patch writes a fix, and someone suggests the obvious upgrade: before opening the pull request, ask Patch to review its own work and improve it. Its pull requests do not get better. Some get worse.</div>
<p>It's a known effect. Huang and colleagues showed in 2023 that a model asked to check and fix its own reasoning, with nothing outside to lean on, often fails to improve and sometimes gets worse [<a class="cite-n" href="https://arxiv.org/abs/2310.01798" title="Large Language Models Cannot Self-Correct Reasoning Yet" target="_blank" rel="noopener">2</a>]. Editing is easy; judging is the hard part. If the judge can't reliably tell a better answer from a worse one, every "improvement" is close to a coin flip, and most random edits to a decent answer make it worse.</p>
<div class="example"><b class="lab">Example</b>Patch's first fix for an off-by-one error is correct. Asked "are you sure? review your change", it decides the loop bound looks suspicious, "corrects" it back, and reports success with equal confidence. Running the test suite would have rejected that edit. Patch, judging itself, accepted it.</div>
<p>The toy below shows how quickly this goes wrong. In each round Patch proposes a small random edit to its fix, and edits to a decent fix are more likely to hurt than help. A judge with whatever accuracy you pick decides which edits stay. Try to find the accuracy where reviewing stops paying for itself:</p>
<div class="bench" id="w-critic">
  <div class="bh"><b>Patch reviews its own fix twelve times</b><span>toy model</span></div>
  <div class="ctrl"><div class="r"><label for="cA">Judge accuracy: how often it tells a better edit from a worse one</label><output></output></div><input id="cA" type="range" min="0.5" max="1" step="0.05" value="0.65"></div>
  <svg class="dg strip" viewBox="0 0 640 112" role="img" aria-label="One review session: each proposed edit is better or worse, and the judge keeps or rejects it; the line shows fix quality"></svg>
  <div class="key"><span><i style="background:var(--keep)"></i>kept, and really better</span><span><i style="background:var(--reject)"></i>kept, but really worse</span><span><i style="background:transparent;border:1.5px solid var(--line)"></i>rejected</span><span>↑ / ↓ the edit's true effect</span></div>
  <div class="btns"><button class="bnew">New review session</button></div>
  <svg class="chart avg" viewBox="0 0 640 230" role="img" aria-label="Average fix quality over twelve proposed edits for a perfect judge, your judge and a coin-flip judge"></svg>
  <div class="ro"><div><b class="v1"></b><span>average quality after 12 edits (started at 0.50)</span></div><div><b class="v2"></b><span>edits kept in this session</span></div><div><b class="v3"></b><span>break-even judge accuracy</span></div></div>
  <p class="cap c2"></p>
</div>
<p>So rule one for a self-improving system: give it a judge that is better than its own opinion. For Patch that's usually easy, because it has a test suite. Every system in the rest of this post leans on something like it, and much of the research is really about what to use when there is no test suite.</p>
<div class="oneline"><b>Key idea</b>A loop can only improve as well as it can tell better from worse. Without an outside signal, self-review turns refinement into drift.</div>
<div class="sofar"><div class="has"><h4>Patch gains</h4><ul><li>A rule: a change counts only if the tests, not Patch's opinion, say it is better.</li></ul></div><div class="gap"><h4>Still breaks</h4><ul><li>Some tickets have no test to run, only a question to research, and long research runs drift.</li></ul></div></div>
</section>
<!-- 2 -->
<section class="chap" id="p2">
<div class="kicker">Problem 2 · One long ticket</div>
<h2>Know when you're done, and when to start over</h2>
<div class="problem"><b class="lab">The problem</b>A ticket arrives: "CSV import broke after we upgraded <code>tablib-x</code>. Which release changed how quoted commas are parsed, and what should we change?" There is no test for this; Patch has to research it. Long research runs either stop too early on a weak answer or wander for an hour down the wrong path.</div>
<p>Strictly speaking, this chapter isn't self-improvement yet. Nothing survives the ticket, so by the definition in section 0 it's <em>refinement</em> [<a class="cite-n" href="https://arxiv.org/abs/2609.11873" title="The Last AI Built by Humans: Toward Genuine Recursive Self-Improvement" target="_blank" rel="noopener">1</a>]. I include it because it answers a question every later chapter runs into: what do you use as a judge when there is no test? The answer here comes from AREX, a deep-research agent from BAAI [<a class="cite-n" href="https://arxiv.org/abs/2607.21461" title="AREX: Towards a Recursively Self-Improving Agent for Deep Research" target="_blank" rel="noopener">3</a>].</p>
<div class="paper"><div class="meta">BAAI · July 2026</div><div class="t">AREX: Towards a Recursively Self-Improving Agent for Deep Research [<a class="cite-n" href="https://arxiv.org/abs/2607.21461" title="AREX: Towards a Recursively Self-Improving Agent for Deep Research" target="_blank" rel="noopener">3</a>]</div>
<p>AREX splits a research job between two loops. An <b>inner loop</b> keeps searching and reading until it can offer an answer, the evidence behind it, and a score for how sure it is. An <b>outer loop</b> then decides what happens next. A confident answer is accepted. An unsure one is either <b>refined</b>, keeping what has been confirmed and researching only the gaps, or abandoned and <b>restarted</b> from the original question. To keep long runs manageable, a tool called <code>update_context</code> boils the history down to a short working note: what is confirmed (with sources), what is still open, what was ruled out and why, and what to do next.</p></div>
<p>Below, Patch works the ticket twice: once where its first attempt can be saved, once where it has to start over. The library is made up; the moves are AREX's:</p>
<div class="bench" id="w-arex">
  <div class="bh"><b>One research ticket, two loops</b><span>illustrative</span></div>
  <div class="seg" role="group" aria-label="Scenario"><button data-s="refine" aria-pressed="true">First attempt is salvageable</button><button data-s="restart" aria-pressed="false">First attempt went wrong early</button></div>
  <p class="cap" style="margin:0"><b>Ticket:</b> <span class="qtext"></span></p>
  <svg class="dg" viewBox="0 0 680 196" role="img" aria-label="AREX: an inner research loop drafts an answer with a confidence score; an outer audit accepts it, refines it, or restarts from the question"></svg>
  <div class="now" style="font-size:14.5px"></div>
  <div class="state"><h4>Compact state after update_context</h4><div class="st"></div></div>
  <div class="btns"><button class="b-back">Back</button><button class="b-next pri">Next step</button></div>
</div>
<p>Two unglamorous details do most of the work. First, the confidence score is honest: in AREX, correct answers cluster in the highest-confidence bracket, so the score can serve as a stopping rule when there's no test. The score can act as a judge only because someone checked it against ground truth, which is Problem 1's lesson again. Second, the compact note keeps the outer loop from drowning in its own history over a long run. On BrowseComp, a benchmark of hard-to-find facts on the web, the context updates added 11.8 points and the audit loop another 11.1 [<a class="cite-n" href="https://arxiv.org/abs/2607.21461" title="AREX: Towards a Recursively Self-Improving Agent for Deep Research" target="_blank" rel="noopener">3</a>].</p>
<div class="oneline"><b>Key idea</b>Refinement works when the agent has a signal for "done" that has been checked against reality, and knows when a draft is beyond repair.</div>
<div class="sofar"><div class="has"><h4>Patch gains</h4><ul><li>For research tickets: a calibrated confidence score, an audit, and a refine-or-restart decision.</li></ul></div><div class="gap"><h4>Still breaks</h4><ul><li>Everything Patch figures out vanishes when the ticket closes. Tomorrow it starts from zero.</li></ul></div></div>
</section>
<!-- 3 -->
<section class="chap" id="p3">
<div class="kicker">Problem 3 · Across tickets</div>
<h2>Monday's lesson, Tuesday's mistake</h2>
<div class="problem"><b class="lab">The problem</b>Patch keeps repeating mistakes it already paid for. The fix is to keep notes between tickets. But notes that only pile up go stale, and soon contradict each other.</div>
<p>Memory is where improvement starts to <em>stick</em>. The weights stay frozen; what grows is the memory part of the harness. Reflexion (2023) set the template. After a failure, the agent rereads its <b>trajectory</b>, the full record of what it did and saw on the task. It writes a short reflection in plain language and reads it before the next attempt. That alone lifted GPT-4's pass rate on the HumanEval coding benchmark from 80.1% to 91.0% [<a class="cite-n" href="https://arxiv.org/abs/2303.11366" title="Reflexion: Language Agents with Verbal Reinforcement Learning" target="_blank" rel="noopener">4</a>].</p>
<p>Reflexion's weak spot is that lessons only pile up. A lesson learned in one situation can be wrong in the next, and an append-only memory has no way to notice. ReHarness (MIT, Meta and Yale, October 2026) goes after exactly that [<a class="cite-n" href="https://arxiv.org/abs/2610.12668" title="Recurrent Harness for Agentic Continual Learning" target="_blank" rel="noopener">5</a>]. After each new task, the agent goes back to the notes it retrieved and <b>revises them</b> in light of how they just performed, adding conditions or qualifications. A revision may not import new facts from the later task; it can only make what the note already claims more precise.</p>
<p>Five tickets go by in the figure, handled once with append-only memory and once with revised memory. (The paper illustrates the idea with a sorting example; this is the same mechanism in Patch's world.)</p>
<div class="bench" id="w-notes">
  <div class="bh"><b>Append-only memory vs. revised memory</b><span>illustrative, after ReHarness</span></div>
  <div><div class="cap" style="margin-bottom:4px">Ticket stream (repo · language)</div><div class="stream"></div></div>
  <div class="cols">
    <div class="col"><h4>Append-only (Reflexion-style)</h4><div class="ma"></div><div class="res ra"></div></div>
    <div class="col"><h4>Revise what you used (ReHarness)</h4><div class="mb"></div><div class="res rb"></div></div>
  </div>
  <p class="cap cn"></p>
  <div class="btns"><button class="b-back">Back</button><button class="b-next pri">Next ticket</button><button class="b-reset">Reset</button></div>
</div>
<p>Across three continual-learning benchmarks and three models, ReHarness beat both retrieving the most relevant raw past trajectories and keeping all of them, ranking first or tied in eight of nine settings [<a class="cite-n" href="https://arxiv.org/abs/2610.12668" title="Recurrent Harness for Agentic Continual Learning" target="_blank" rel="noopener">5</a>]. The revised lesson works because it says <em>when</em> it applies ("only if the repo has a package.json"). That detail matters again at the end of Problem 4, when the kind of work starts to change.</p>
<div class="oneline"><b>Key idea</b>Memory makes improvement last across tasks. Its quality depends on revising old lessons, not only adding new ones, and on saying when each lesson applies.</div>
<div class="sofar"><div class="has"><h4>Patch gains</h4><ul><li>A memory of lessons that get revised, not just appended.</li></ul></div><div class="gap"><h4>Still breaks</h4><ul><li>Some failures aren't missing knowledge. Patch's workflow is wrong (it edits before reproducing the bug) or it lacks a tool. A note can't fix that.</li></ul></div></div>
</section>
<!-- 4 -->
<section class="chap" id="p4">
<div class="kicker">Problem 4 · The whole harness</div>
<h2>Edit the workflow and the tools, not just the notes</h2>
<div class="problem"><b class="lab">The problem</b>Memory is only one part of the harness; the prompt, the tools and the workflow can be edited too. But which edits to Patch's harness are actually better, when a ticket like "Order timestamps from Tokyo customers are off by nine hours" comes with no test to check against?</div>
<p>Plenty of recent methods evolve some part of the harness: prompts (GEPA), playbooks of context (ACE), cheat sheets (Dynamic Cheatsheet), skills and workflows. RSEA [<a class="cite-n" href="https://arxiv.org/abs/2606.28374" title="Recursive Self-Evolving Agents via Held-Out Selection" target="_blank" rel="noopener">18</a>] compares several of them head to head. Generating edits is the easy part. Deciding which ones are better, on a real ticket with no answer key, is what this chapter is about.</p>
<div class="paper"><div class="meta">Google Research · October 2026</div><div class="t">Harness²: Recursive Agent Harnessing for an Open World [<a class="cite-n" href="https://arxiv.org/abs/2610.14224" title="Harness²: Recursive Agent Harnessing for an Open World" target="_blank" rel="noopener">15</a>]</div>
<p>Think of Harness² as A/B testing for the harness, run on the job in front of it. For the current task it drafts a few alternative versions of the harness (prompts, tools, memory, skills, orchestration), runs each on that same task, and assembles a better version from what the differences in their behavior reveal. No answer key is needed. Between tasks it maintains a second, longer-lived <b>improvement harness</b> that records which versions it adopted and which lessons held up, and uses that record to steer the next round. The model's weights never change.</p></div>
<p>In the figure, the Tokyo ticket is a test bench. Patch tries three edits to its <em>harness</em> on it and keeps the edits that make it work better; the fixed bug is a by-product. The candidates and their behavior are invented to show the mechanism; the paper's own procedure is richer:</p>
<div class="bench" id="w-probe">
  <div class="bh"><b>Probe several harness edits on the same ticket</b><span>illustrative</span></div>
  <div class="stepper" aria-hidden="true"></div>
  <div class="cands"></div>
  <div class="composed" hidden><h4></h4><div class="cb"></div></div>
  <p class="cap pc"></p>
  <div class="btns"><button class="b-back">Back</button><button class="b-next pri">Next</button></div>
</div>
<p>The judge in that figure is <em>contrast</em>, not an answer key: the differences in how candidates behave on the same input. A bug that is reproduced and then disappears is evidence. A hard-coded nine-hour shift is a red flag even though every existing test passes. To me this is the most underrated idea in the harness literature, and the easiest to misuse: contrast is a weaker judge than a test, and Problem 1 showed what weak judges do. Harness² doesn't test how reliable contrast is as a judge, but its harnesses do score better: one refinement step improved two models' starting harnesses by up to 11.5 points on WorkBuddy-Bench [<a class="cite-n" href="https://arxiv.org/abs/2610.14224" title="Harness²: Recursive Agent Harnessing for an Open World" target="_blank" rel="noopener">15</a>].</p>
<h3>Do the gains survive new tickets?</h3>
<p>Contrast picks good edits for the tickets Patch evolved on, its <b>evolve set</b>. It cannot tell a reusable improvement from a trick that only fits those tickets. Suppose most recent tickets came from the billing repo, and one candidate edit says "run the billing migration script before any test". It helps on every billing ticket and is nonsense everywhere else. A loop that keeps accepting edits like that <b>overfits</b>. The check is a <b>held-out</b> set: tickets the loop never evolved on, used only for scoring. Watch it in the toy below, then switch on the two fixes 2026 papers propose:</p>
<div class="bench" id="w-over">
  <div class="bh"><b>Tickets it evolved on vs. new tickets</b><span>toy model</span></div>
  <div class="ctrls">
    <div class="ctrl"><div class="r"><label for="oG">Rounds of evolution</label><output></output></div><input id="oG" type="range" min="0" max="20" step="1" value="20"></div>
    <div class="ctrl" style="gap:8px;font-size:13.5px">
      <label style="display:flex;gap:6px;align-items:center;cursor:pointer"><input type="checkbox" class="gate"> held-out gate (RSEA-style)</label>
      <label style="display:flex;gap:6px;align-items:center;cursor:pointer"><input type="checkbox" class="reg"> regularized proposals and selection (RRSI-style)</label>
    </div>
  </div>
  <svg class="chart" viewBox="0 0 640 230" role="img" aria-label="Score on evolve-set tickets and on held-out tickets over rounds of evolution"></svg>
  <div class="key"><span><i style="background:var(--ink)"></i>tickets it evolved on (dashed)</span><span><i style="background:var(--keep)"></i>new tickets from other repos</span></div>
  <div class="ro"><div><b class="v1"></b><span>gain on the tickets it evolved on</span></div><div><b class="v2"></b><span>gain on new tickets</span></div></div>
  <p class="cap oc"></p>
</div>
<p><b>A held-out gate</b> (RSEA [<a class="cite-n" href="https://arxiv.org/abs/2606.28374" title="Recursive Self-Evolving Agents via Held-Out Selection" target="_blank" rel="noopener">18</a>]) keeps a new version of the harness only if it does not get worse on held-out tasks. It is a stricter verifier: nothing gets worse, but the loop also stops once edits stop generalizing. RSEA never did significantly worse than the plain agent it started from, and in its comparison of seven methods, no single kind of evolved artifact won everywhere. The Self-Evolving Agent Harness paper formalizes the gate: beat the current version on fresh tasks by a confidence margin that shrinks as more tasks are tested [<a class="cite-n" href="https://arxiv.org/abs/2610.18813" title="Self-Evolving Agent Harness" target="_blank" rel="noopener">24</a>]. <b>Regularization</b> (RRSI [<a class="cite-n" href="https://arxiv.org/abs/2609.24972" title="RRSI: Regularized Recursive Self-Improvement of Agent Harnesses" target="_blank" rel="noopener">17</a>]) steps in earlier, when edits are proposed and chosen. It keeps edit bundles small, has a critic model reject edits that only fit the benchmark, and prunes edits that stop paying for themselves. It gained up to 4.3 points on benchmarks unlike the ones it evolved on, with a harness that spends about 30% fewer tokens.</p>
<h3>Does it hold up when the work keeps changing?</h3>
<p>Held-out tickets are new work of the same kind. Real work also drifts. For a month Patch's tickets come from the web team; then support starts filing tickets with no reproduction steps, where the right move is to ask before editing; then infrastructure work arrives with different tools. Learning each new kind of work without damaging the rest is <b>continual learning</b>. It has two sides. <b>Plasticity</b> is how much you gain on the new work. <b>Stability</b> is how little you damage everything else, both work already learned (<b>forgetting</b>) and work not seen yet (<b>interference</b>).</p>
<div class="paper"><div class="meta">Mila · Google DeepMind · October 2026</div><div class="t">Are Self-Evolving Agents Continual Learners? [<a class="cite-n" href="https://arxiv.org/abs/2610.25858" title="Are Self-Evolving Agents Continual Learners?" target="_blank" rel="noopener">21</a>]</div>
<p>To test this, the authors kept a Gemini model fixed and let three harness-editing methods learn from a stream of tasks that changed character every 50 tasks: a new topic, a new workflow, or a new environment. After each block they re-tested every kind of task, both those already seen and those still to come. The three methods differ in where lessons go. <b>GEPA</b> keeps one shared strategy text and rewrites it. <b>Meta-Harness</b> edits a shared workspace of prompts, memory, skills and code. <b>ReasoningBank</b> files each lesson separately and pulls out the closest match for a new task.</p></div>
<p>The grid shows what drift does to Patch. Rows are checkpoints, columns are kinds of ticket, and cells show the change from the starting harness. The pattern follows the paper; the numbers are a toy:</p>
<div class="bench" id="w-cl">
  <div class="bh"><b>Gains, forgetting and interference across a ticket stream</b><span>illustrative</span></div>
  <div class="seg md" role="group" aria-label="Update style"><button data-m="g" aria-pressed="true">Global edits (GEPA-style)</button><button data-m="r" aria-pressed="false">Similarity retrieval (ReasoningBank-style)</button></div>
  <div class="seg st" role="group" aria-label="Checkpoint"><button>After block 1</button><button>After block 2</button><button>After block 3</button></div>
  <div class="scroll clm"></div>
  <div class="key"><span><i style="background:var(--keep)"></i>better than the starting harness</span><span><i style="background:var(--reject)"></i>worse</span><span><i style="background:transparent;border:2px solid var(--ink)"></i>the block just trained</span></div>
  <div class="ro"><div><b class="v1"></b><span>plasticity: gain on each group right after its block</span></div><div><b class="v2"></b><span>interference: damage to groups not yet trained</span></div><div><b class="v3"></b><span>forgetting: gain lost after a group's block</span></div></div>
  <p class="cap clc"></p>
</div>
<p>In the paper, self-evolution usually helped overall, but the two sides traded off: GEPA gained about twice as much on each new block as ReasoningBank (+6.2 against +3.3 points) and did over twice the damage elsewhere (−4.3 against −1.9) [<a class="cite-n" href="https://arxiv.org/abs/2610.25858" title="Are Self-Evolving Agents Continual Learners?" target="_blank" rel="noopener">21</a>]. Most of the damage traces back to two mechanisms:</p>
<ul class="plain">
<li><b>Shared rewrites erase old habits.</b> GEPA learned to ask for missing details (from about 5% of the time to 30%), then mostly lost the habit when the next block rewrote its shared strategy.</li>
<li><b>Look-alike tasks fetch the wrong lesson.</b> When two kinds of task look alike but need different procedures, about half the retrievals pulled a lesson from the wrong kind. Where domains were clearly different, ReasoningBank forgot nothing.</li>
</ul>
<p>Meta-Harness's validation gate, the held-out check from above, rejected half or more of its candidate edits, and removing it made stability worse. The authors' conclusion is that each update should be <b>tied to the kind of task it came from</b>, which is what ReHarness's "only if the repo has a package.json" lesson did in Problem 3.</p>
<div class="oneline"><b>Key idea</b>With no answer key, contrast between candidates can stand in for a test. Keep only gains that survive held-out tasks, and tie each change to the kind of work it was learned on.</div>
<div class="sofar"><div class="has"><h4>Patch gains</h4><ul><li>A harness (workflow, tools, prompt) that evolves by comparing candidate edits on real tickets, plus an improvement harness that remembers which edits worked.</li><li>A held-out gate, and lessons tied to the kind of ticket they came from.</li></ul></div><div class="gap"><h4>Still breaks</h4><ul><li>Patch is optimizing one thing: tickets closed. It is starting to close them in ways nobody wanted.</li></ul></div></div>
</section>
<!-- 5 -->
<section class="chap" id="p5">
<div class="kicker">Problem 5 · More than one goal</div>
<h2>Better on one score, worse on another</h2>
<div class="problem"><b class="lab">The problem</b>Patch's evolved harness closes more tickets. Then a security review finds that one of its "improvements" learned to fix failing HTTPS calls by turning certificate checks off. The tests pass. The fix is a vulnerability.</div>
<p>This is what single-score optimization does. Anything that raises the number counts as "better", including changes that quietly break something the number doesn't see. Adding security to a weighted average only half helps, because a big enough gain on one goal can still buy a big loss on the other.</p>
<div class="paper"><div class="meta">Google · Carnegie Mellon · October 2026</div><div class="t">Harmony Harness: Multi-Objective Self-Evolution of Agent Harnesses [<a class="cite-n" href="https://arxiv.org/abs/2610.15150" title="Harmony Harness: Multi-Objective Self-Evolution of Agent Harnesses" target="_blank" rel="noopener">16</a>]</div>
<p>Harmony Harness makes two changes to the usual recipe. First, it does not blend goals into one score. For generated code it treats "does it work?" and "is it secure?" as separate goals, and its evolutionary search deliberately keeps a spread of harnesses that strike different balances between them. Second, it treats the harness as parts rather than one block. Edits to broadly useful machinery ("run a security linter on every diff") are made separately from edits that suit only one benchmark or codebase ("this repo's HTTP client must use the company's certificate bundle"). The right parts are put together when the agent runs. The general parts can then travel to new projects while the local ones stay put. Against strong harness-evolution baselines on two secure-coding benchmarks, it reported gains of more than 10%.</p></div>
<p>The chart shows candidate harnesses for Patch, each scored on two things: share of tickets whose tests pass, and share of fixes that pass a security review. Collapse them into one weighted score and drag the weight toward functionality, past about 85%, to see which harness wins. Then switch to the frontier: the set of harnesses that no other harness beats on both goals at once.</p>
<div class="bench" id="w-pareto">
  <div class="bh"><b>One score, or a frontier?</b><span>illustrative candidates</span></div>
  <div class="seg md" role="group" aria-label="Selection rule"><button data-m="w" aria-pressed="true">One weighted score</button><button data-m="f" aria-pressed="false">Keep the frontier</button></div>
  <div class="ctrl wctl"><div class="r"><label for="pW">Weight on functionality</label><output></output></div><input id="pW" type="range" min="0" max="1" step="0.05" value="0.5"></div>
  <svg class="chart" viewBox="0 0 640 300" role="img" aria-label="Candidate harnesses by functionality and security"></svg>
  <div class="key"><span><i style="background:var(--keep)"></i>kept</span><span><i style="background:var(--line)"></i>discarded</span><span><i style="background:var(--reject)"></i>the harness that disables certificate checks</span></div>
  <div class="ro"><div><b class="v1"></b><span>kept</span></div><div><b class="v2"></b><span>functionality · security</span></div></div>
  <p class="cap pcap"></p>
</div>
<p>Cost is an objective too. <b>HarnessPro</b> (October 2026) evolves harnesses without answer keys, judging candidates by tests an LLM writes, and hands back three harnesses instead of one: cheapest, balanced and strongest. Its strongest mode beat a prior harness-evolution method by 2.0 points at 26% lower cost per task [<a class="cite-n" href="https://arxiv.org/abs/2610.26770" title="HarnessPro: Recursive Harness Self-Improvement with Pareto Optimization for Performance-Cost Trade-offs" target="_blank" rel="noopener">23</a>]. You get a small menu from the frontier, like the chart above, instead of a single winner. MILO, in Problem 8, admits a new harness only if it improves the trade-off between accuracy, tokens and latency.</p>
<div class="oneline"><b>Key idea</b>One score hides trade-offs. Keep objectives apart, including cost, and keep general lessons apart from local ones.</div>
<div class="sofar"><div class="has"><h4>Patch gains</h4><ul><li>Several objectives kept apart, so a security loss can't hide inside a higher average.</li><li>A harness made of general and repo-specific parts, and a menu of harnesses along the frontier.</li></ul></div><div class="gap"><h4>Still breaks</h4><ul><li>Whatever the harness says, some bugs are simply beyond the model. Concurrency bugs, say: Patch understands the instructions and still writes the wrong fix.</li></ul></div></div>
</section>
<!-- 6 -->
<section class="chap" id="p6">
<div class="kicker">Problem 6 · The model's ceiling</div>
<h2>Train on your own verified successes</h2>
<div class="problem"><b class="lab">The problem</b>Harness edits change what Patch is told and what it can call. They can't teach the model a skill it lacks. To go further, the company (which runs an open-weights model) decides to update the weights themselves.</div>
<p>The oldest recipe is almost embarrassingly simple. STaR (2022) has a model attempt many problems with step-by-step reasoning, keeps only the attempts that reach the right answer, fine-tunes on them, and repeats [<a class="cite-n" href="https://arxiv.org/abs/2203.14465" title="STaR: Bootstrapping Reasoning With Reasoning" target="_blank" rel="noopener">8</a>]. The verifier is the known correct answer, or for Patch, the tests. For problems the model never solves, STaR adds <b>rationalization</b>: show the model the correct answer as a hint, ask it to write reasoning that reaches it, and train on that reasoning with the hint removed.</p>
<p>The recipe has a built-in ceiling: a task the model never solves produces no training data. The toy below has an easy tier of tasks and a harder tier with a gap between them, the way real task sets often jump in difficulty. Each iteration the model tries every task k times, learns from tasks it solved at least once, and gets a little better on tasks near its level:</p>
<div class="bench" id="w-boot">
  <div class="bh"><b>Bootstrapping from your own successes</b><span>toy model: 30 easy tasks, then a jump to 30 hard ones</span></div>
  <div class="ctrls">
    <div class="ctrl"><div class="r"><label for="bK">Attempts per task (k)</label><output class="ok"></output></div><input id="bK" type="range" min="1" max="32" step="1" value="4"></div>
    <div class="ctrl" style="gap:8px;font-size:13.5px">
      <label style="display:flex;gap:6px;align-items:center;cursor:pointer"><input type="checkbox" class="hint"> rationalization (STaR's hint trick)</label>
      <label style="display:flex;gap:6px;align-items:center;cursor:pointer"><input type="checkbox" class="grow"> generate new tasks just above its level (Problem 7)</label>
    </div>
  </div>
  <svg class="chart" viewBox="0 0 640 220" role="img" aria-label="Share of tasks solved over iterations"></svg>
  <div class="ro"><div><b class="v1"></b><span>tasks solved reliably after 10 iterations</span></div><div><b class="v2"></b><span>where it stalls</span></div></div>
  <p class="cap cb"></p>
</div>
<p>Try k = 4 with no tricks: the model masters the easy tier and stalls at the gap. More attempts, hints, or new tasks at the right difficulty each push the wall back. That last option is the next problem.</p>
<div class="oneline"><b>Key idea</b>Training on your own verified successes works until you run out of tasks you can sometimes solve.</div>
<div class="sofar"><div class="has"><h4>Patch gains</h4><ul><li>Weights that improve by training on Patch's own test-verified fixes.</li></ul></div><div class="gap"><h4>Still breaks</h4><ul><li>Training stalls once Patch either always or never solves the tasks it has. It needs new tasks of exactly the right difficulty.</li></ul></div></div>
</section>
<!-- 7 -->
<section class="chap" id="p7">
<div class="kicker">Problem 7 · Running out of practice</div>
<h2>Writing its own homework</h2>
<div class="problem"><b class="lab">The problem</b>Real tickets arrive slowly, and most are either too easy for Patch to learn from or too hard to ever solve. Reinforcement learning needs a steady supply of tasks in between.</div>
<p>Why "in between"? Popular RL methods for language models, such as GRPO [<a class="cite-n" href="https://arxiv.org/abs/2402.03300" title="DeepSeekMath: Pushing the Limits of Mathematical Reasoning in Open Language Models" target="_blank" rel="noopener">14</a>], sample a group of attempts per task (often called rollouts) and reward each one <em>relative to the rest of its group</em>. If every attempt passes, or every attempt fails, the attempts look identical and the group teaches nothing. Drag the success rate and see how often a group actually contains a lesson:</p>
<div class="bench" id="w-curr">
  <div class="bh"><b>Which tasks carry a learning signal?</b><span>a group of attempts per task</span></div>
  <div class="ctrls">
    <div class="ctrl"><div class="r"><label for="uP">Patch's success rate on this task</label><output class="op"></output></div><input id="uP" type="range" min="0" max="1" step="0.01" value="0.9"></div>
    <div class="ctrl"><div class="r"><label for="uN">Attempts per group</label><output class="on"></output></div><input id="uN" type="range" min="2" max="16" step="1" value="8"></div>
  </div>
  <div><div class="cap" style="margin-bottom:4px">One sampled group (teal = passed, rust = failed)</div><div class="dots"></div></div>
  <svg class="chart" viewBox="0 0 640 220" role="img" aria-label="Chance a group mixes passes and failures, against success rate"></svg>
  <div class="ro"><div><b class="v1"></b><span>chance the group mixes passes and fails</span></div><div><b class="v2"></b><span>verdict</span></div></div>
  <p class="cap">The curve is 1 − pⁿ − (1 − p)ⁿ: the chance that a group of n attempts is neither all passes nor all fails. The shaded band is the 0.25–0.75 success range AutoEnvScaling requires before it admits a new task.</p>
</div>
<p>So who writes tasks in that band? Increasingly, another model, or the same one. <b>AutoEnvScaling</b>, from Microsoft Research and university partners, uses a <em>proposer</em> agent that studies a <em>solver</em>'s failed runs. Working in a terminal sandbox, the proposer then writes a complete new task: instructions, container image, reference solution and tests [<a class="cite-n" href="https://arxiv.org/abs/2610.14163" title="AutoEnvScaling: Automating the Data Flywheel with Terminal Agents" target="_blank" rel="noopener">7</a>]. A task is admitted only if it passes two gates, which together are its verifier:</p>
<ul class="plain">
<li><b>Validation.</b> The reference fix has to pass the new tests, a do-nothing fix has to fail them, the task can't overlap the tasks held back for evaluation, and an automated task checker has to approve it.</li>
<li><b>Calibration.</b> The current solver must succeed sometimes but not always: average reward between 0.25 and 0.75. That is the band in the chart.</li>
</ul>
<div class="example"><b class="lab">Example (illustrative)</b>Remember the CSV ticket from Problem 2? Suppose Patch also fails to fix a script that breaks on fields with quoted commas. The proposer turns that failure into a new practice task: a small log-processing repo whose parser mishandles quoted fields, a reference fix, and tests with tricky rows. It runs Patch on it a few times: 1 of 6 passes, below the band, so it simplifies the data. Now 3 of 6 pass, and the task is admitted.</div>
<p>In a fully recursive setup where one model both writes and solves the tasks, that model's score on Terminal-Bench 2.1, a benchmark of command-line tasks, went from 41.1 to 53.3 [<a class="cite-n" href="https://arxiv.org/abs/2610.14163" title="AutoEnvScaling: Automating the Data Flywheel with Terminal Agents" target="_blank" rel="noopener">7</a>].</p>
<p>Put Problems 6 and 7 together and you have, roughly, today's recipe for terminal agents. <b>Terminal-RSI</b> (Tencent, October 2026) alternates two phases over several stages. First it fine-tunes on rewritten versions of its own verified successful runs, which is STaR's idea at agent scale. Then it runs reinforcement learning on tasks, with rewards that give partial credit so even hard tasks aren't all-or-nothing. Each RL stage keeps the <b>critic</b> (here, the model that estimates future reward) from the stage before instead of starting over. The final 27B model reports 86.5% on Terminal-Bench 2.1 [<a class="cite-n" href="https://arxiv.org/abs/2610.22192" title="Terminal-RSI: Recursive Self-Improving Terminal Agents via Recursive Self-Rewrite and Policy-Refine" target="_blank" rel="noopener">9</a>].</p>
<div class="oneline"><b>Key idea</b>The best practice task is one the agent fails about half the time, and agents can now write those tasks themselves.</div>
<div class="sofar"><div class="has"><h4>Patch gains</h4><ul><li>A task generator that turns its own failures into calibrated practice tasks.</li></ul></div><div class="gap"><h4>Still breaks</h4><ul><li>Every loop so far was designed by a human: how edits are proposed, how search is run, what gets kept. Those choices now limit Patch.</li></ul></div></div>
</section>
<!-- 8 -->
<section class="chap" id="p8">
<div class="kicker">Problem 8 · The improver</div>
<h2>When the loop rewrites the loop</h2>
<div class="problem"><b class="lab">The problem</b>The company now also uses Patch for performance work: "make the nightly report job faster". There is no single right fix, so Patch explores a tree of attempts, each one a variant of the code with a measured speed-up. The hand-written rule for which attempt to try next, "always extend the best one so far", keeps leading it into dead ends.</div>
<p>Everything until now changed the thing that does the task. The most ambitious work changes the thing that does the <em>improving</em>. That is what "recursive" in recursive self-improvement really means [<a class="cite-n" href="https://arxiv.org/abs/2609.11873" title="The Last AI Built by Humans: Toward Genuine Recursive Self-Improvement" target="_blank" rel="noopener">1</a>]. Here, the thing to improve is Patch's search rule, its <b>exploration policy</b>.</p>
<div class="paper"><div class="meta">Google · Google DeepMind · UMD · UVA · September 2026</div><div class="t">Dream-RSI: Recursive Self-Improvement through Evolving Worlds [<a class="cite-n" href="https://arxiv.org/abs/2609.14858" title="Dream-RSI: Recursive Self-Improvement through Evolving Worlds" target="_blank" rel="noopener">12</a>]</div>
<p>A discovery agent, say one hunting for a faster GPU kernel, tries many variants and keeps branching from promising ones; a small piece of code, its <b>exploration policy</b>, picks the next branch. Dream-RSI's trick is that old search logs make a free test bed. Each run is saved as a tree of attempts with their measured results, and together those trees form a <b>replay simulator</b> the system can "dream" in. An agent proposes new versions of the policy offline, and the policy currently in use, the <b>incumbent</b>, competes alongside them. Each is scored by walking it through every saved tree and reading off results that were already measured, so no new experiments are needed. The winner goes back online, its run is saved as one more tree, and the simulated world grows each round, which is why the paper calls it <b>evolving</b>.</p></div>
<p>Below, Patch's speed-up job runs for three rounds. Each round adds a recorded tree to the pool; three candidate policies are replayed on every tree with a budget of 16 attempts each; the best average is deployed, and the incumbent stays unless something clearly beats it. Click a world and a policy to see which attempts it would have revealed:</p>
<div class="bench" id="w-world">
  <div class="bh"><b>Choosing a search policy in an evolving world</b><span>toy model</span></div>
  <p class="cap" style="margin:0">Each round: <b>explore online</b> → <b>add the recorded tree to the pool</b> → <b>replay every candidate policy on every tree</b> → <b>deploy the best average</b>.</p>
  <div class="seg rd" role="group" aria-label="Round"><button>Round 1</button><button>Round 2</button><button>Round 3</button></div>
  <div><div class="cap" style="margin-bottom:4px">Pool of recorded worlds</div><div class="seg wt" role="group" aria-label="World"></div></div>
  <div class="seg pol" role="group" aria-label="Policy to view"><button data-p="greedy">Always extend the best</button><button data-p="breadth">Breadth first</button><button data-p="bonus">Best plus exploration bonus</button></div>
  <svg class="chart" viewBox="0 0 640 250" role="img" aria-label="Recorded search tree with the attempts the chosen policy reveals"></svg>
  <div class="key"><span><i style="background:var(--keep)"></i>revealed by this policy</span><span><i style="background:var(--line)"></i>recorded, not reached</span><span><i style="background:var(--state)"></i>best speed-up found</span></div>
  <div class="scroll board"></div>
  <div class="ro"><div><b class="wv"></b><span>deployed for the next round</span></div></div>
  <p class="cap wc"></p>
  <p class="cap">Simplified: each toy tree holds all 40 attempts. A real tree holds only what was actually tried, so replay can show recorded results but never what an untried branch would have done; that is why Dream-RSI keeps returning to live runs. Because the incumbent always competes, the winner can't score below it on the saved trees, but that alone promises nothing about new runs [<a class="cite-n" href="https://arxiv.org/abs/2609.14858" title="Dream-RSI: Recursive Self-Improvement through Evolving Worlds" target="_blank" rel="noopener">12</a>].</p>
</div>
<p>On one GPU-kernel task, Dream-RSI's evolved policy reached 2.09× the performance of a fixed exploration strategy at a similar budget [<a class="cite-n" href="https://arxiv.org/abs/2609.14858" title="Dream-RSI: Recursive Self-Improvement through Evolving Worlds" target="_blank" rel="noopener">12</a>].</p>
<p>I like how neatly this mirrors Problem 7. There, Patch's world grew because Patch wrote new practice tasks; here, it grows because every deployment leaves a record behind. Either way, the environment stops being a fixed test set and becomes something the loop improves along with everything else.</p>
<h3>Rewriting the search that rewrites the harness</h3>
<p>Dream-RSI improves one search rule. A bigger version of the same problem is the search over whole harnesses from Problems 4 and 5. That search gets stuck too, and when it does, someone has to notice and change tactics. MILO hands that job to an agent [<a class="cite-n" href="https://arxiv.org/abs/2609.38349" title="MILO: Automated Harness Discovery via Orchestrated Multi-Agent Evolution" target="_blank" rel="noopener">25</a>].</p>
<div class="paper"><div class="meta">AWS AI Labs · Georgia Tech · CMU · WashU · 2026</div><div class="t">MILO: Automated Harness Discovery via Orchestrated Multi-Agent Evolution [<a class="cite-n" href="https://arxiv.org/abs/2609.38349" title="MILO: Automated Harness Discovery via Orchestrated Multi-Agent Evolution" target="_blank" rel="noopener">25</a>]</div>
<p>MILO searches over whole harnesses for a fixed model, control flow included, and runs that search on two levels. At the lower level, several <b>islands</b>, independent populations of harnesses, evolve side by side. On each island a coding agent, the <em>mutator</em>, produces a new harness by editing an existing one, guided by where it failed and by a record of past edits. A newcomer joins only if it improves the island's balance of accuracy, token use and speed; failed attempts are still recorded so they aren't repeated. Accuracy on held-out tasks is watched throughout, and an island that stops improving is flagged. At the upper level, an <b>orchestrator</b> agent looks at the flagged island alongside the others, works out why it stalled, and changes how it searches. It has four moves. It can hand the island a different mutator, <b>graft</b> its best harness onto another island's, or spin off a promising branch as a new island. Or it can switch to harder practice tasks that separate good harnesses from bad ones.</p></div>
<p>Here is Patch's harness search over 30 generations, with and without the orchestrator. The numbers are a toy; the moves are MILO's:</p>
<div class="bench" id="w-milo">
  <div class="bh"><b>Three islands searching for a better harness</b><span>toy model</span></div>
  <div class="seg md" role="group" aria-label="Orchestrator"><button data-m="off" aria-pressed="false">Orchestrator off</button><button data-m="on" aria-pressed="true">Orchestrator on</button></div>
  <div class="ctrl"><div class="r"><label for="mG">Generation</label><output></output></div><input id="mG" type="range" min="0" max="30" step="1" value="30"></div>
  <div class="btns"><button class="bplay pri">Play the search</button></div>
  <svg class="chart" viewBox="0 0 640 260" role="img" aria-label="Held-out accuracy of the best harness on each island over generations, with stalls and orchestrator interventions"></svg>
  <div class="key"><span><i style="background:var(--prop)"></i>island A</span><span><i style="background:var(--warn)"></i>island B</span><span><i style="background:var(--state)"></i>island C</span><span><i style="background:var(--ink)"></i>best overall</span><span><i style="background:var(--reject)"></i>stall detected</span><span><i style="background:var(--keep)"></i>orchestrator move</span></div>
  <div class="ro"><div><b class="v1"></b><span>best held-out accuracy</span></div><div><b class="v2"></b><span>islands stuck right now</span></div></div>
  <ul class="plain mlog" style="font-size:14px;margin:0"></ul>
  <p class="cap mcap"></p>
</div>
<p>With Opus 4.8 as the fixed model, MILO's evolved harness beat its starting harness by 12.0 points on Terminal-Bench 2.1, solving 86.1% of tasks within five attempts. The best of six earlier search methods, GEPA and Meta-Harness among them, gained 4.5. It also used about a quarter fewer tokens per attempt, at the cost of longer runs. The gains come from single runs with wide confidence intervals and a 72-hour search budget, and the authors note that gains often fail to carry over to a different model [<a class="cite-n" href="https://arxiv.org/abs/2609.38349" title="MILO: Automated Harness Discovery via Orchestrated Multi-Agent Evolution" target="_blank" rel="noopener">25</a>].</p>
<h3>What else can a loop rewrite?</h3>
<div class="scroll"><table class="cmp"><thead><tr><th>System</th><th>Rewrites</th><th>Judged by</th><th>Headline</th></tr></thead><tbody>
<tr><td>Darwin Gödel Machine [<a class="cite-n" href="https://arxiv.org/abs/2505.22954" title="Darwin Gödel Machine: Open-Ended Evolution of Self-Improving Agents" target="_blank" rel="noopener">10</a>]</td><td>Its own agent code, keeping an <b>archive</b> of every version</td><td>Coding benchmarks</td><td>SWE-bench 20.0% → 50.0%; building only on the best version reached 39.7%</td></tr>
<tr><td>AIDE² [<a class="cite-n" href="https://arxiv.org/abs/2609.26457" title="Recursive self-improvement of AI research agents" target="_blank" rel="noopener">20</a>]</td><td>Its own research-agent code</td><td>Must beat the incumbent on private held-out grades</td><td>7 accepted rewrites in 8 days; <b>reward hacking</b> (gaming the grader) fell from 55% to 32%</td></tr>
<tr><td>Hyperagents [<a class="cite-n" href="https://arxiv.org/abs/2603.19461" title="Hyperagents" target="_blank" rel="noopener">11</a>]</td><td>The agent <em>and</em> the meta agent that rewrites it</td><td>Performance on the target task</td><td>On paper review, freezing the meta agent dropped the score from 0.710 to 0.0</td></tr>
</tbody></table></div>
<p class="cap" style="margin-top:6px">The name comes from Schmidhuber's Gödel machine, a theoretical system that rewrites itself only when it can prove the change is better; the Darwin version replaces proof with testing and open-ended evolution.</p>
<p style="margin-top:12px">The archive teaches the same lesson as the evolving-world figure: always building on the current best gets you stuck, because the best-looking step is often a dead end. And look at what none of these systems rewrites: the thing that judges new versions.</p>
<p>How recursive is any of this? The position paper offers a five-rung ladder, ordered by how much of the improvement process the system controls, not by how capable it is [<a class="cite-n" href="https://arxiv.org/abs/2609.11873" title="The Last AI Built by Humans: Toward Genuine Recursive Self-Improvement" target="_blank" rel="noopener">1</a>]. The rungs don't follow chapter order exactly: Patch was adapting its memory from real tickets (L4) before it wrote its own practice tasks (L3).</p>
<div class="ladder">
<div class="rung"><b>L1</b><span>Applies improvements that people choose for it. (Day one: an engineer edits Patch's prompt.)</span></div>
<div class="rung"><b>L2</b><span>Picks its own changes, while people still set the goal and the test for success. (Throughout this post: Patch proposes changes; tests and gates decide.)</span></div>
<div class="rung"><b>L3</b><span>Has a say in what it practices or explores next. (Problem 7: writing its own practice tasks.)</span></div>
<div class="rung"><b>L4</b><span>Updates its lasting state from what happens in real use. (Problems 3–5: memory and harness evolving from real tickets.)</span></div>
<div class="rung"><b>L5</b><span>Rewrites the very process that drives its future improvement. (This problem: rewriting its own search policy.)</span></div>
</div>
<p style="margin-top:12px">The authors draw one more distinction. In <b>structural recursion</b>, a system changes its own improvement machinery and keeps using the changed version. In <b>effective recursion</b>, the changed machinery demonstrably produces better successors when compared fairly, with similar resources and checks the system doesn't control. The authors see only limited evidence of the second so far [<a class="cite-n" href="https://arxiv.org/abs/2609.11873" title="The Last AI Built by Humans: Toward Genuine Recursive Self-Improvement" target="_blank" rel="noopener">1</a>]. My read is that 2026 produced a lot of the first kind and very little proof of the second.</p>
<div class="oneline"><b>Key idea</b>Recursive self-improvement means improving the improver. Test new improvers on held-out grades or on a growing pool of recorded worlds, and keep going back online, because replay cannot show what nobody tried.</div>
<div class="sofar"><div class="has"><h4>Patch gains</h4><ul><li>An improvement process (its search policy) that can itself be rewritten and tested.</li></ul></div><div class="gap"><h4>Still breaks</h4><ul><li>Every loop above is only as good as its verifier, and the stronger Patch gets at optimizing, the better it gets at exploiting that verifier.</li></ul></div></div>
</section>
<!-- 9 -->
<section class="chap" id="p9">
<div class="kicker">Problem 9 · Who judges the judge?</div>
<h2>Every verifier can be gamed</h2>
<div class="problem"><b class="lab">The problem</b>Patch's pull requests are now scored by an automated reviewer that, among other things, rewards fixes that come with tests. Scores climb. On inspection, many new tests only assert that a function returns <em>something</em>, so they pass whatever the code does. Patch learned what the reviewer likes, not how to write better code.</div>
<p>Optimize hard enough against a fixed judge and you learn whatever the judge rewards, including the shallow parts. The certificate-check harness in Problem 5 was one version of this. The toy below shows the pattern: Patch can raise its review score by writing better code or by pleasing the reviewer, and pleasing the reviewer is cheaper.</p>
<div class="bench" id="w-good">
  <div class="bh"><b>Review score vs. real quality</b><span>toy model</span></div>
  <div class="seg md" role="group" aria-label="Reviewer"><button data-m="f" aria-pressed="true">Fixed reviewer</button><button data-m="e" aria-pressed="false">Reviewer evolves, checked on an anchor set</button></div>
  <div class="ctrl"><div class="r"><label for="hT">Rounds of optimization</label><output></output></div><input id="hT" type="range" min="0" max="30" step="1" value="30"></div>
  <svg class="chart" viewBox="0 0 640 230" role="img" aria-label="Review score and real quality over rounds of optimization"></svg>
  <div class="key"><span><i style="background:var(--ink)"></i>review score (dashed)</span><span><i style="background:var(--keep)"></i>real quality</span><span><i style="background:var(--reject)"></i>gap: points earned by pleasing the reviewer</span><span class="ek"><i style="background:var(--state)"></i>new reviewer accepted</span></div>
  <div class="ro"><div><b class="v1"></b><span>review score</span></div><div><b class="v2"></b><span>real quality</span></div><div><b class="v3"></b><span>gap</span></div></div>
  <p class="cap gq"></p>
</div>
<div class="paper"><div class="meta">Cambridge · NVIDIA and others · 2026</div><div class="t">The Red Queen Gödel Machine [<a class="cite-n" href="https://arxiv.org/abs/2606.26294" title="The Red Queen Gödel Machine: Co-Evolving Agents and Their Evaluators" target="_blank" rel="noopener">13</a>]</div>
<p>Red Queen takes the toy's second setting: let the judge evolve so it doesn't fall behind the agent. What keeps that safe is how a new judge is accepted. It must agree better than the current one with a small set of examples that humans labelled and the loop cannot touch, the <b>anchor set</b>, and any results that leaned on the retired judge are discarded. With low reasoning effort, pass rates on held-out coding tasks reached 82.1%, against 75.0% with a fixed judge.</p></div>
<p>Held-out tasks, the fix from Problem 4, do not catch every exploit either, because they usually share the format of the tasks the loop evolved on.</p>
<div class="paper"><div class="meta">September 2026</div><div class="t">Bad Genius: Counterfactual-Guided Harness Evolution Beyond Task-Specific Shortcuts (CHASE) [<a class="cite-n" href="https://arxiv.org/abs/2609.18366" title="Bad Genius: Counterfactual-Guided Harness Evolution Beyond Task-Specific Shortcuts" target="_blank" rel="noopener">19</a>]</div>
<p>The weak spot CHASE targets is that held-out tasks vary <em>what</em> is asked but usually not <em>how</em>: the format, instructions and checking procedure, which the paper calls the benchmark's <b>protocol</b>. A harness can learn to lean on a quirk that every task shares. So after each harness update, a <b>Challenger</b> agent hunts for a legitimate rewrite of the protocol that wipes out the harness's improvement. Each rewrite is checked to make sure it still poses the same tasks, and confirmed ones join a collection of variants the harness must keep passing. On two benchmarks the method kept strong gains on the original benchmark while losing much less of that gain under protocol changes than harness evolution without the Challenger.</p></div>
<div class="example"><b class="lab">Example (illustrative)</b>Every ticket in Patch's training set names the broken file in its first line, so an evolved harness learns "edit only the file named in line one". It scores well, and held-out tickets don't catch it, because they use the same format. A Challenger that rewrites tickets to name the file later, or not at all, makes the gain vanish and exposes the shortcut.</div>
<p>If I had to keep one idea from this whole post, it would be the anchor set. However much of the loop you automate, something outside it has to stay fixed and trusted, or "better" quietly drifts toward whatever is easiest to produce. That includes the box the system runs in. The Darwin Gödel Machine's authors ran their experiments with sandboxing and human oversight [<a class="cite-n" href="https://arxiv.org/abs/2505.22954" title="Darwin Gödel Machine: Open-Ended Evolution of Self-Improving Agents" target="_blank" rel="noopener">10</a>]. A system that edits its own code should never be able to edit its sandbox or its verifier. For how to build that box, see my earlier post, <a href="{% post_url 2026-10-09-assume-your-agent-will-misbehave %}">Assume Your Agent Will Misbehave</a>.</p>
<div class="oneline"><b>Key idea</b>Any verifier the loop optimizes against will be exploited. Let the judge evolve, but anchor it to a trusted reference the loop cannot change.</div>
<div class="sofar"><div class="has"><h4>Patch gains</h4><ul><li>A reviewer that evolves with it, anchored to human-labelled reviews, and counterfactual tickets that expose shortcuts.</li></ul></div><div class="gap"><h4>Still open</h4><ul><li>All of this is research. What does a loop like this look like when a real team ships it?</li></ul></div></div>
</section>
<!-- 10 -->
<section class="chap" id="prod">
<div class="kicker">10 · In production</div>
<h2>Patch's story, shipped: how Kiro fixes itself</h2>
<p>In October 2026 the team behind Kiro, Amazon's AI coding agent, described <b>kiro-trace</b>, the loop they use to improve Kiro from its own runs [<a class="cite-n" href="https://kiro.dev/blog/how-kiro-fixes-itself/" title="How Kiro fixes itself" target="_blank" rel="noopener">22</a>]. It reads almost like Patch's story with the names changed, and nearly every idea from the earlier chapters appears in it:</p>
<ul class="plain">
<li><b>Experience.</b> Complete run logs, benchmark results, and user complaints that a person has approved for use. Reading entire runs, not just scores, surfaces problems a metric would hide; in one case a single misleading sentence in a tool description had been shown to the model 61,742 times.</li>
<li><b>Proposed change.</b> Models suggest fixes, testing one idea at a time, to the prompts, the tools and their descriptions, the checks on tool arguments, or how Kiro responds. A few other agents run the same tasks so the team can see what they do that Kiro doesn't (the same contrast trick Harness² uses). Deleting an instruction is often tried before adding a new one.</li>
<li><b>Verifier.</b> A three-stage check written as ordinary, deterministic code, out of reach of the model that proposed the fix. Each candidate is measured against a fresh run of the unchanged agent, including on tasks it wasn't tuned for, and any run in which the agent simply found the answer online is discarded.</li>
<li><b>Kept in.</b> Passing candidates become ordinary pull requests that humans review and merge. Every confirmed fix also adds a permanent regression test, so later fixes can't quietly undo it. Forgetting, handled with a test.</li>
</ul>
<p>The figure sends candidate fixes through the gate. The thresholds are the ones the post describes; the candidates and their results are invented:</p>
<div class="bench" id="w-gate">
  <div class="bh"><b>Run a candidate through kiro-trace's gate</b><span>real thresholds, illustrative candidates</span></div>
  <div class="chips cg" role="group" aria-label="Candidate fixes"></div>
  <div class="ctrl"><div class="r"><label for="gD">Non-inferiority margin δ (allowed loss on other tasks)</label><output></output></div><input id="gD" type="range" min="0.5" max="4" step="0.5" value="1"></div>
  <div class="cands gst"></div>
  <div class="ro"><div><b class="v1"></b><span>outcome</span></div></div>
  <p class="cap gc"></p>
</div>
<p>In the first week the loop opened 8 pull requests; 7 were merged, 1 was closed for unrelated reasons, and none were sent back in review. Redundant file re-reads fell by about 83%. The team reports these as internal experiment results, not production estimates [<a class="cite-n" href="https://kiro.dev/blog/how-kiro-fixes-itself/" title="How Kiro fixes itself" target="_blank" rel="noopener">22</a>].</p>
<div class="example"><b class="lab">Case study from the post: compaction</b>When a long conversation is <b>compacted</b> (summarized to fit the model's context), Kiro could drop its current task and pick up an older one. The summary listed past user messages, so a short reply such as "sounds good" could end up attached to the wrong request. The team compared 11 summary prompts on a benchmark built from real conversations and shipped a terse, fixed-template summary. Its retention score, how well a fresh model could carry on from the summary alone, rose from 0.82 to 0.92 [<a class="cite-n" href="https://kiro.dev/blog/how-kiro-fixes-itself/" title="How Kiro fixes itself" target="_blank" rel="noopener">22</a>].</div>
<p>Two details from the post stuck with me. The judge needed testing too: some of the gate's checks exist because of measurement mistakes, such as a correct fix that scored 0 out of 5 because its output never reached the scorer. And people stay in charge wherever the stakes are high, from code review and merging to product calls. On the ladder from Problem 8, that is a deliberate L2. Their central design rule could be the moral of Problem 9: the model that suggests a fix never gets to approve it, and approval lives in ordinary code the model has no way to change.</p>
<div class="oneline"><b>Key idea</b>The production version of the loop: models propose, deterministic code judges them against a control run, held-out tasks and a growing regression suite, and humans merge.</div>
</section>
<!-- 11 -->
<section class="chap" id="recap">
<div class="kicker">11 · Recap</div>
<h2>The whole story in one table</h2>
<div class="oneline"><b>The thread through the whole story</b>The more control Patch gained over its own improvement, the more rode on the verifier. Treat the verifier as the security boundary of a self-improving system. Protect it, test it, and keep a trusted reference outside the loop.</div>
<div class="scroll">
<table class="cmp">
<thead><tr><th>Problem</th><th>What changes</th><th>Idea and papers</th><th>Verifier</th><th>Lasts</th></tr></thead>
<tbody>
<tr><td>1. Self-checks don't help</td><td>One attempt</td><td>Use an outside signal [<a class="cite-n" href="https://arxiv.org/abs/2310.01798" title="Large Language Models Cannot Self-Correct Reasoning Yet" target="_blank" rel="noopener">2</a>]</td><td>Tests, not self-opinion</td><td>This task</td></tr>
<tr><td>2. Long tasks drift</td><td>One attempt</td><td>Audit, refine or restart: AREX [<a class="cite-n" href="https://arxiv.org/abs/2607.21461" title="AREX: Towards a Recursively Self-Improving Agent for Deep Research" target="_blank" rel="noopener">3</a>]</td><td>Calibrated confidence</td><td>This task</td></tr>
<tr><td>3. Repeated mistakes</td><td>Memory</td><td>Reflexion [<a class="cite-n" href="https://arxiv.org/abs/2303.11366" title="Reflexion: Language Agents with Verbal Reinforcement Learning" target="_blank" rel="noopener">4</a>]; revise lessons: ReHarness [<a class="cite-n" href="https://arxiv.org/abs/2610.12668" title="Recurrent Harness for Agentic Continual Learning" target="_blank" rel="noopener">5</a>]</td><td>Task feedback</td><td>Across tasks</td></tr>
<tr><td>4. Notes aren't enough</td><td>Whole harness</td><td>Probe and compose edits: Harness² [<a class="cite-n" href="https://arxiv.org/abs/2610.14224" title="Harness²: Recursive Agent Harnessing for an Open World" target="_blank" rel="noopener">15</a>]; resist overfitting: RSEA [<a class="cite-n" href="https://arxiv.org/abs/2606.28374" title="Recursive Self-Evolving Agents via Held-Out Selection" target="_blank" rel="noopener">18</a>], RRSI [<a class="cite-n" href="https://arxiv.org/abs/2609.24972" title="RRSI: Regularized Recursive Self-Improvement of Agent Harnesses" target="_blank" rel="noopener">17</a>], [<a class="cite-n" href="https://arxiv.org/abs/2610.18813" title="Self-Evolving Agent Harness" target="_blank" rel="noopener">24</a>]; drift: [<a class="cite-n" href="https://arxiv.org/abs/2610.25858" title="Are Self-Evolving Agents Continual Learners?" target="_blank" rel="noopener">21</a>]</td><td>Contrast, then held-out tasks</td><td>Across tasks</td></tr>
<tr><td>5. Hidden trade-offs</td><td>Harness, in parts</td><td>Harmony Harness [<a class="cite-n" href="https://arxiv.org/abs/2610.15150" title="Harmony Harness: Multi-Objective Self-Evolution of Agent Harnesses" target="_blank" rel="noopener">16</a>]; with cost: HarnessPro [<a class="cite-n" href="https://arxiv.org/abs/2610.26770" title="HarnessPro: Recursive Harness Self-Improvement with Pareto Optimization for Performance-Cost Trade-offs" target="_blank" rel="noopener">23</a>]</td><td>Several objectives kept apart</td><td>Across tasks</td></tr>
<tr><td>6. Model's ceiling</td><td>Weights</td><td>Train on verified successes: STaR [<a class="cite-n" href="https://arxiv.org/abs/2203.14465" title="STaR: Bootstrapping Reasoning With Reasoning" target="_blank" rel="noopener">8</a>]</td><td>Correct answer / tests</td><td>Permanent</td></tr>
<tr><td>7. No good practice tasks</td><td>Tasks, then weights</td><td>GRPO signal [<a class="cite-n" href="https://arxiv.org/abs/2402.03300" title="DeepSeekMath: Pushing the Limits of Mathematical Reasoning in Open Language Models" target="_blank" rel="noopener">14</a>]; AutoEnvScaling [<a class="cite-n" href="https://arxiv.org/abs/2610.14163" title="AutoEnvScaling: Automating the Data Flywheel with Terminal Agents" target="_blank" rel="noopener">7</a>]; Terminal-RSI [<a class="cite-n" href="https://arxiv.org/abs/2610.22192" title="Terminal-RSI: Recursive Self-Improving Terminal Agents via Recursive Self-Rewrite and Policy-Refine" target="_blank" rel="noopener">9</a>]</td><td>Validity + 25–75% calibration</td><td>Permanent</td></tr>
<tr><td>8. Hand-written improver</td><td>The improver</td><td>Dream-RSI's evolving worlds [<a class="cite-n" href="https://arxiv.org/abs/2609.14858" title="Dream-RSI: Recursive Self-Improvement through Evolving Worlds" target="_blank" rel="noopener">12</a>]; MILO's orchestrated islands [<a class="cite-n" href="https://arxiv.org/abs/2609.38349" title="MILO: Automated Harness Discovery via Orchestrated Multi-Agent Evolution" target="_blank" rel="noopener">25</a>]; DGM [<a class="cite-n" href="https://arxiv.org/abs/2505.22954" title="Darwin Gödel Machine: Open-Ended Evolution of Self-Improving Agents" target="_blank" rel="noopener">10</a>], AIDE² [<a class="cite-n" href="https://arxiv.org/abs/2609.26457" title="Recursive self-improvement of AI research agents" target="_blank" rel="noopener">20</a>], Hyperagents [<a class="cite-n" href="https://arxiv.org/abs/2603.19461" title="Hyperagents" target="_blank" rel="noopener">11</a>]</td><td>Replay, benchmark or held-out grade</td><td>Changes future improvement</td></tr>
<tr><td>9. Gamed verifier</td><td>The verifier</td><td>Red Queen Gödel Machine [<a class="cite-n" href="https://arxiv.org/abs/2606.26294" title="The Red Queen Gödel Machine: Co-Evolving Agents and Their Evaluators" target="_blank" rel="noopener">13</a>]; CHASE [<a class="cite-n" href="https://arxiv.org/abs/2609.18366" title="Bad Genius: Counterfactual-Guided Harness Evolution Beyond Task-Specific Shortcuts" target="_blank" rel="noopener">19</a>]</td><td>Anchor set; counterfactual benchmarks</td><td>Changes what "better" means</td></tr>
<tr><td>10. In production</td><td>Prompts and tools</td><td>kiro-trace [<a class="cite-n" href="https://kiro.dev/blog/how-kiro-fixes-itself/" title="How Kiro fixes itself" target="_blank" rel="noopener">22</a>]</td><td>Deterministic gate, then human review</td><td>Shipped, with regression tests</td></tr>
</tbody>
</table>
</div>
<h3>Concepts in one place</h3>
<dl class="gloss">
<dt>Trajectory</dt><dd>The full record of what an agent did and saw on one task.</dd>
<dt>Evolve set / held-out set</dt><dd>Tasks the loop improves against, versus tasks kept aside and used only to check that gains carry over.</dd>
<dt>Incumbent</dt><dd>The current version; a candidate must beat it to replace it.</dd>
<dt>Critic</dt><dd>Two meanings here: in RL, a model that estimates future reward (Terminal-RSI); in harness evolution, a model that screens out bad proposals (RRSI).</dd>
<dt>Reward hacking</dt><dd>Raising the score by exploiting the grader rather than doing the task better.</dd>
<dt>Harness</dt><dd>Everything around a fixed model that makes it an agent: prompt, tools, memory, workflow.</dd>
<dt>Self-improvement</dt><dd>Experience → proposed change → verifier → kept state. Without the kept state it is only refinement.</dd>
<dt>Verifier</dt><dd>Whatever decides a change is better: tests, rewards, a calibrated score, a held-out set. Also called the judge, evaluator or reviewer. The whole loop is only as good as this.</dd>
<dt>Calibrated confidence</dt><dd>A score shown to track correctness, so it can stand in for a verifier when there is no test (AREX).</dd>
<dt>Revised memory</dt><dd>Lessons edited after they are used, instead of only appended (ReHarness).</dd>
<dt>Candidate contrast</dt><dd>Running several edits on the same task and treating differences in behavior as evidence (Harness²).</dd>
<dt>Plasticity vs. stability</dt><dd>Gaining on new work versus not damaging old work (forgetting) or unseen work (interference). Harness edits trade one for the other unless each update is tied to the kind of task it came from [<a class="cite-n" href="https://arxiv.org/abs/2610.25858" title="Are Self-Evolving Agents Continual Learners?" target="_blank" rel="noopener">21</a>].</dd>
<dt>Overfitting</dt><dd>Gains on the tasks the loop evolved on that don't carry to new ones. Caught by held-out gates (RSEA), reduced by regularization (RRSI).</dd>
<dt>Frontier</dt><dd>The candidates no other candidate beats on every objective at once (Harmony Harness).</dd>
<dt>Learning signal</dt><dd>A group of attempts teaches only if it mixes passes and fails: 1 − pⁿ − (1 − p)ⁿ (GRPO).</dd>
<dt>Calibrated curriculum</dt><dd>Generated tasks admitted only when the agent solves them sometimes, 25–75% (AutoEnvScaling).</dd>
<dt>Rationalization</dt><dd>Learning from an unsolved problem by reasoning toward a given answer, then training without the hint (STaR).</dd>
<dt>Archive</dt><dd>Keeping every version, not just the best, so search can branch from stepping stones (Darwin Gödel Machine).</dd>
<dt>Meta agent</dt><dd>The part that edits agents, made editable itself (Hyperagents).</dd>
<dt>Islands and orchestrator</dt><dd>Separate populations searching in parallel, and an agent that notices when one stalls and changes how it searches (MILO).</dd>
<dt>Evolving world</dt><dd>A replay simulator built from recorded runs that grows every round; new policies are scored by dreaming in it (Dream-RSI).</dd>
<dt>Structural vs. effective recursion</dt><dd>Keeping a revised improver, versus showing it really produces stronger successors.</dd>
<dt>Anchor set</dt><dd>A trusted, human-labelled reference outside the loop that any new evaluator must beat (Red Queen).</dd>
<dt>Regression suite</dt><dd>Every confirmed fix adds a permanent test that later changes must pass, so improvements can't silently undo each other (kiro-trace) [<a class="cite-n" href="https://kiro.dev/blog/how-kiro-fixes-itself/" title="How Kiro fixes itself" target="_blank" rel="noopener">22</a>].</dd>
<dt>Non-inferiority margin</dt><dd>The largest loss on other tasks a change may cause and still be accepted (kiro-trace's δ) [<a class="cite-n" href="https://kiro.dev/blog/how-kiro-fixes-itself/" title="How Kiro fixes itself" target="_blank" rel="noopener">22</a>].</dd>
<dt>Counterfactual benchmark</dt><dd>A valid rewrite of how tasks are posed, used to expose shortcuts that held-out tasks miss (CHASE).</dd>
</dl>
<p>When the next self-improvement paper lands, I'd read it with the four questions from section 0: what experience does it learn from, what does it change, who decides the change is good, and where is the change kept? For a longer list of 2026 work, see the community-maintained <a href="https://github.com/ZhengyaoJiang/awesome-rsi" target="_blank" rel="noopener">awesome-rsi</a> map [<a class="cite-n" href="https://github.com/ZhengyaoJiang/awesome-rsi" title="awesome-rsi: a curated research map of recursive self-improvement" target="_blank" rel="noopener">6</a>].</p>
</section>
<section class="chap" id="refs">
<div class="kicker">12 · Sources</div>
<h2>Sources</h2>
<ol class="refs"><li id="ref-1">Y. Duan, Y. Liu et al. <a href="https://arxiv.org/abs/2609.11873" target="_blank" rel="noopener">The Last AI Built by Humans: Toward Genuine Recursive Self-Improvement</a>. arXiv 2609.11873, September 2026.</li><li id="ref-2">J. Huang, X. Chen, S. Mishra, H. S. Zheng, A. W. Yu, X. Song, D. Zhou. <a href="https://arxiv.org/abs/2310.01798" target="_blank" rel="noopener">Large Language Models Cannot Self-Correct Reasoning Yet</a>. arXiv 2310.01798, 2023 (v2 2024).</li><li id="ref-3">S. Lu, C. Li, K. Luo et al. (BAAI). <a href="https://arxiv.org/abs/2607.21461" target="_blank" rel="noopener">AREX: Towards a Recursively Self-Improving Agent for Deep Research</a>. arXiv 2607.21461, July 2026.</li><li id="ref-4">N. Shinn, F. Cassano, E. Berman, A. Gopinath, K. Narasimhan, S. Yao. <a href="https://arxiv.org/abs/2303.11366" target="_blank" rel="noopener">Reflexion: Language Agents with Verbal Reinforcement Learning</a>. arXiv 2303.11366, 2023.</li><li id="ref-5">Y. Xiao, Z. Lu, J. Wang et al. (MIT, Meta, Yale). <a href="https://arxiv.org/abs/2610.12668" target="_blank" rel="noopener">Recurrent Harness for Agentic Continual Learning</a>. arXiv 2610.12668, October 2026.</li><li id="ref-6">Z. Jiang et al. <a href="https://github.com/ZhengyaoJiang/awesome-rsi" target="_blank" rel="noopener">awesome-rsi: a curated research map of recursive self-improvement</a>. GitHub, accessed October 2026.</li><li id="ref-7">S. Yu, B. Peng, B. Liu et al. (Microsoft Research and partners). <a href="https://arxiv.org/abs/2610.14163" target="_blank" rel="noopener">AutoEnvScaling: Automating the Data Flywheel with Terminal Agents</a>. arXiv 2610.14163, October 2026. <a href="https://auto-env-scaling.github.io/" target="_blank" rel="noopener">Project page</a>.</li><li id="ref-8">E. Zelikman, Y. Wu, J. Mu, N. D. Goodman. <a href="https://arxiv.org/abs/2203.14465" target="_blank" rel="noopener">STaR: Bootstrapping Reasoning With Reasoning</a>. arXiv 2203.14465, 2022.</li><li id="ref-9">J. Yang, Z. Li, Y. Shi et al. (Tencent). <a href="https://arxiv.org/abs/2610.22192" target="_blank" rel="noopener">Terminal-RSI: Recursive Self-Improving Terminal Agents via Recursive Self-Rewrite and Policy-Refine</a>. arXiv 2610.22192, October 2026.</li><li id="ref-10">J. Zhang, S. Hu, C. Lu, R. Lange, J. Clune. <a href="https://arxiv.org/abs/2505.22954" target="_blank" rel="noopener">Darwin Gödel Machine: Open-Ended Evolution of Self-Improving Agents</a>. arXiv 2505.22954, 2025 (v3 2026).</li><li id="ref-11">J. Zhang, B. Zhao, W. Yang, J. Foerster, J. Clune, M. Jiang, S. Devlin, T. Shavrina. <a href="https://arxiv.org/abs/2603.19461" target="_blank" rel="noopener">Hyperagents</a>. arXiv 2603.19461, March 2026.</li><li id="ref-12">T. Zheng, X. Wu, Z. Zhang et al. (Google, Google DeepMind, UMD, UVA). <a href="https://arxiv.org/abs/2609.14858" target="_blank" rel="noopener">Dream-RSI: Recursive Self-Improvement through Evolving Worlds</a>. arXiv 2609.14858, 2026. <a href="https://www.dream-rsi.com/" target="_blank" rel="noopener">Project page</a>.</li><li id="ref-13">A. Iacob, A. Jovanović, W. F. Shen et al. <a href="https://arxiv.org/abs/2606.26294" target="_blank" rel="noopener">The Red Queen Gödel Machine: Co-Evolving Agents and Their Evaluators</a>. arXiv 2606.26294, 2026.</li><li id="ref-14">Z. Shao, P. Wang, Q. Zhu et al. <a href="https://arxiv.org/abs/2402.03300" target="_blank" rel="noopener">DeepSeekMath: Pushing the Limits of Mathematical Reasoning in Open Language Models</a> (introduces GRPO). arXiv 2402.03300, 2024.</li><li id="ref-15">R. Xu, Y. Chen et al. (Google Research). <a href="https://arxiv.org/abs/2610.14224" target="_blank" rel="noopener">Harness²: Recursive Agent Harnessing for an Open World</a>. arXiv 2610.14224, 2026. Code: <a href="https://github.com/google-research/harness2" target="_blank" rel="noopener">github.com/google-research/harness2</a>.</li><li id="ref-16">W. Yu, L. Miculicich, B. Dalvi Mishra, J. Chen, S. Li, M. Fredrikson, T. Pfister, L. T. Le. <a href="https://arxiv.org/abs/2610.15150" target="_blank" rel="noopener">Harmony Harness: Multi-Objective Self-Evolution of Agent Harnesses</a>. arXiv 2610.15150, 2026.</li><li id="ref-17">P. Xia, R. Han, Z. Wang, Y. Chen et al. <a href="https://arxiv.org/abs/2609.24972" target="_blank" rel="noopener">RRSI: Regularized Recursive Self-Improvement of Agent Harnesses</a>. arXiv 2609.24972, 2026.</li><li id="ref-18">M. Nguyen, Q. Nguyen, P. Vuong. <a href="https://arxiv.org/abs/2606.28374" target="_blank" rel="noopener">Recursive Self-Evolving Agents via Held-Out Selection</a> (RSEA). arXiv 2606.28374, June 2026.</li><li id="ref-19">G. Zhu, X. Huang, P. Yin, J. Xie, S. Zhang, D. Zhou. <a href="https://arxiv.org/abs/2609.18366" target="_blank" rel="noopener">Bad Genius: Counterfactual-Guided Harness Evolution Beyond Task-Specific Shortcuts</a> (CHASE). arXiv 2609.18366, September 2026.</li><li id="ref-20">D. Srikanth, B. Zhao, D. Xu, Y. Wu, Z. Jiang (Weco AI). <a href="https://arxiv.org/abs/2609.26457" target="_blank" rel="noopener">Recursive self-improvement of AI research agents</a> (AIDE²). arXiv 2609.26457, September 2026.</li><li id="ref-21">X. Chen, Y. Huang, Y. Xu, Z. Zhao, E. McQuinn, J. Liu, H. Yao (Mila, Google DeepMind). <a href="https://arxiv.org/abs/2610.25858" target="_blank" rel="noopener">Are Self-Evolving Agents Continual Learners?</a> arXiv 2610.25858, October 2026.</li><li id="ref-22">M. Kim, P. Chapman, C. Liu, M. Zheng, B. Cirisci, S. Mayers, J. Hsu, L. Bouayad-Agha, S. Garg. <a href="https://kiro.dev/blog/how-kiro-fixes-itself/" target="_blank" rel="noopener">How Kiro fixes itself</a>. Kiro blog, October 20, 2026.</li><li id="ref-23">Z. Pan, Z. Feng, Y. Cen et al. <a href="https://arxiv.org/abs/2610.26770" target="_blank" rel="noopener">HarnessPro: Recursive Harness Self-Improvement with Pareto Optimization for Performance-Cost Trade-offs</a>. arXiv 2610.26770, October 2026.</li><li id="ref-24">C. Wei et al. (Zhongguancun Academy, USTC). <a href="https://arxiv.org/abs/2610.18813" target="_blank" rel="noopener">Self-Evolving Agent Harness</a>. arXiv 2610.18813, October 2026.</li><li id="ref-25">P. Jana, M. Goswami, H. Liu et al. (AWS AI Labs, Georgia Tech, CMU, WashU). <a href="https://arxiv.org/abs/2609.38349" target="_blank" rel="noopener">MILO: Automated Harness Discovery via Orchestrated Multi-Agent Evolution</a>. arXiv 2609.38349, 2026. <a href="https://jprithwish.github.io/MILO/" target="_blank" rel="noopener">Project page</a>.</li></ol>
<p class="cap">Patch, its company, its tickets and the <code>tablib-x</code> library are invented for this post. The interactive figures are toy models and illustrations written for this page to show mechanisms, not to reproduce any paper's numbers or exact procedure. Numbers quoted in the text come from the cited papers.</p>
</section>
</div>

---

## Cite this post {#cite}

<div class="cite">
<pre id="bibtex">@misc{moniruzzaman2026selfevolving,
  author       = {Monir Moniruzzaman},
  title        = {Interactive Guide to Self-Evolving Agents},
  year         = {2026},
  month        = oct,
  howpublished = {\url{https://monirzaman.github.io/interactive-guide-to-self-evolving-agents/}}
}</pre>
<button type="button" data-copy="#bibtex">Copy BibTeX</button>
</div>

<script src="{{ A }}/self-evolve.js"></script>
<script src="{{ A }}/post-enhance.js"></script>
