---
layout: post
title: "Reliable Coding Agents Through a State Machine: AI-DLC"
date: 2026-11-07
description: "Instructions alone don't keep a coding agent on process. How AWS's AI-DLC pairs Claude Code with a state machine and hooks, what that means for AI code review, and how Anthropic, GitHub, OpenAI and Google approach the same problem."
excerpt: "An agent was told to write a plan, get it approved, then write code. It wrote the code first and the plan afterwards. How AWS's AI-DLC uses a state machine and hooks to turn rules like that into guarantees, what it means for AI code review, and how the major labs compare. Five interactive figures."
tags: [agents, coding-agents, claude-code, code-review, hooks, ai-dlc]
---

<style>
  /* Jekyll Now leaves tables unstyled; scoped to posts so other pages are untouched */
  .entry table { border-collapse: collapse; font-size: 15px; margin: 1em 0; }
  .entry th, .entry td { border: 1px solid #ddd; padding: 6px 10px; text-align: left; vertical-align: top; }
  .entry th { background: #f6f8fa; }
  .entry .tbl-wide table { min-width: 640px; }
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
  .post .entry .fig-narrow img { max-width: 520px; width: 100%; display: block; margin: 0 auto; }
  @media (max-width: 640px) { .post h1 { font-size: 28px; } .post .entry { font-size: 17px; line-height: 1.65; } }

  /* Colour key used by every figure in this post */
  .k-prompt { color: #bc4c00; font-weight: 600; }  /* instructions the model may ignore */
  .k-engine { color: #6d28d9; font-weight: 600; }  /* the state machine */
  .k-hook { color: #0969da; font-weight: 600; }    /* code that can refuse */
  .k-human { color: #1a7f37; font-weight: 600; }   /* you */

  /* Pull-quote for the thesis */
  .thesis { font-size: 1.18em; line-height: 1.5; border-top: 1px solid #d0d7de; border-bottom: 1px solid #d0d7de; padding: .8em 0; margin: 1.6em 0; }

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
</style>

{% assign A = "/assets/posts/ai-dlc" | relative_url %}

AWS's AI-DLC project has a rule for coding agents that sounds too obvious to break: write a plan, get it approved, and only then write code. For a while the rule lived where most agent rules live, in the instructions.

Then a field report came in. The agent had written the code first, and *then* produced a plan beside the finished code, describing what it had just built. The instructions were clear, and they lost. The maintainers left a note about it in the source of their fix, with a phrase I keep coming back to: the report showed "prose losing that contest" [[1]](#ref-1).

Here is the same request, run once with the rule in the prompt and once with the rule enforced:

<div class="backfill-widget"></div>
<script src="{{ A }}/backfill-widget.js"></script>

<p class="thesis">A coding agent follows a process only as far as something outside the model enforces it. Everything else is a request.</p>

That sentence is the whole post. The rest is about how AI-DLC turns requests into guarantees with a state machine and a handful of hooks, why the same trick matters for AI code review, and how Anthropic, GitHub, OpenAI and Google approach the same problem. It's a companion to [Assume Your Agent Will Misbehave]({% post_url 2026-10-09-assume-your-agent-will-misbehave %}), which used the same kind of check to stop *dangerous* actions; here the target is actions taken *out of order*.

A note on the figures: <span class="k-prompt">orange</span> always means instructions the model may ignore, <span class="k-engine">violet</span> the state machine, <span class="k-hook">blue</span> code that can refuse, and <span class="k-human">green</span> you.

* TOC
{:toc}

---

## 1. A state machine beside the model {#loop}

The simplest way to picture AI-DLC is a contractor and a project manager. Claude is the contractor: it does all the actual work. The engine is the project manager with a clipboard. It never touches the work. It only knows where the job stands and what comes next.

Concretely, the engine is a command-line program that lives in your project, and Claude calls it the way it would call `git`. Every step of the workflow goes through the same exchange. Watch one stage go round:

<div class="loop-widget"></div>
<script src="{{ A }}/loop-widget.js"></script>

Claude asks `aidlc engine orchestrate next`. The engine reads a state file and replies with exactly one move: run this stage, ask the person this question, or stop. Claude does that one thing and reports back with `orchestrate report`, and the engine, and only the engine, updates the record. Asking twice returns the same answer, so a confused agent can't skip ahead by asking again [[2]](#ref-2).

The division of labour is deliberate. The skill file says the engine "owns all between-stage routing" [[2]](#ref-2), while Claude owns the quality of the work inside each step. Routing is the part a model gets wrong when its context is crowded or it's overconfident, so it's the part taken away from the model.

Around this loop sits a full software lifecycle: 5 phases, 33 stages, 14 agents (two of them dedicated reviewers) and 11 workflow profiles, so after setup a bug fix runs 6 stages while an enterprise feature runs all 30 [[1]](#ref-1)[[3]](#ref-3). It installs into seven coding agents, among them Claude Code, Codex CLI, Cursor and GitHub Copilot. AWS open-sourced it in November 2025; version 2.11.3 shipped on November 4, 2026 [[4]](#ref-4)[[5]](#ref-5).

There is an obvious hole, though. Claude is only *told* to call the engine.

---

## 2. Hooks: where requests become guarantees {#hooks}

Claude Code lets you register **hooks**, scripts that run at fixed moments in a session: before a tool call, after one, when you send a message, when the agent tries to stop. A hook that runs before a tool call can veto it by exiting with code 2 [[1]](#ref-1). That veto is the piece that doesn't depend on the model's cooperation.

AI-DLC wires a hook into nearly every one of those moments, and every hook consults the same engine [[6]](#ref-6). The result is three layers, each with a different job:

<div class="fig-narrow" markdown="1">

![Three layers of enforcement: the prompt asks, the engine decides, hooks can refuse]({{ A }}/fig-layers.svg)

</div>

<p class="fig-cap">Only the hook layer can stop a tool call outright. <i>Diagram by the author from AI-DLC's settings and skill files <a href="#ref-2">[2]</a><a href="#ref-6">[6]</a>; simplified.</i></p>

The maintainers sum up the design in one line: determinism "in tools and hooks, knowledge in agents, judgement with humans" [[1]](#ref-1). I think that's the right split, and it generalises well beyond this project.

The hook that started it all is the **plan-approval guard**. While code is being generated, every write to your project has to clear three checks: a plan exists, a person approved it in a real message of their own, and the plan on disk is byte-for-byte the one they approved [[1]](#ref-1). Try to slip past it:

<div class="gate-widget"></div>
<script src="{{ A }}/gate-widget.js"></script>

Two details deserve honesty. The byte-for-byte recheck is the default only in the Enterprise profile; elsewhere an edited plan is logged and accepted rather than re-asked [[3]](#ref-3)[[7]](#ref-7). And there is an off switch for when the guard misfires, but flipping it leaves a `GUARD_DISABLED` entry in the audit trail [[1]](#ref-1). You can turn the guardrail off; you can't do it quietly.

---

## 3. The same lesson, applied to code review {#review}

Code review is where this stops being an AWS curiosity. Anthropic launched Code Review for Claude Code in March 2026 and now runs it on nearly every internal pull request. Before, 16% of their PRs got substantive review comments; with it, 54% do [[8]](#ref-8). Several agents hunt for bugs in parallel, a verification step filters out false positives, the confirmed issues are ranked by severity, and fewer than 1% of findings are marked incorrect [[9]](#ref-9).

Review turns out to have exactly the same weakness as planning. AI-DLC's source records two more cases where a written rule lost, each followed by a hook that now enforces it [[10]](#ref-10)[[11]](#ref-11):

| The rule, as written | What the agent actually did | What enforces it now |
|---|---|---|
| Write the plan, get approval, then code | Coded first, wrote the plan afterwards | **Plan-approval guard:** no code write without a matching approval |
| Once a review is recorded, don't touch what was reviewed | Applied the reviewer's suggestions *after* the review, voiding it, then re-reviewed in a loop until the session stalled | **Review freeze:** refuses writes that would invalidate a fresh review |
| A reviewer checks its own unit of work | Searched across every unit, so review cost grew faster than the number of units | **Reviewer scope:** refuses a reviewer's reads outside its unit |

<p class="fig-cap">Each story is recorded in the header comment of the hook that fixed it <a href="#ref-1">[1]</a><a href="#ref-10">[10]</a><a href="#ref-11">[11]</a>.</p>

The second row is my favourite, because it's such a human failure. The agent did the helpful thing, and in doing so destroyed the evidence that the work had been checked.

OpenAI's Codex plugin for Claude Code reaches the same idea from another direction. Claude writes the code and Codex reviews it, read-only. Turn on the optional review gate and a Stop hook runs that review whenever Claude tries to finish, refusing to let it stop while issues remain [[12]](#ref-12). In effect: you are not done until a different model agrees.

Put these together and a few principles fall out. A review only counts for the exact code it saw; change anything afterwards and you need a new one, which is what GitHub's "dismiss stale pull request approvals" setting enforces for human teams [[21]](#ref-21). The reviewer should be separate from the author, whether that means a dedicated agent or a different model altogether. Its reading should be bounded, or it gets slower and more expensive with every file you add. And approval stays with a person. Anthropic is explicit that Code Review won't approve pull requests: "that's still a human call" [[8]](#ref-8). AI-DLC encodes the same rule in a human-presence check that no scope or Guard Policy can lower; only a machine-wide override switches it off, and AI-DLC says so while it is [[13]](#ref-13).

---

## 4. How the others approach it {#compare}

AWS isn't alone in trying to give coding agents a process. Here are four comparable systems from Anthropic, GitHub, OpenAI and Google beside AI-DLC. Press the buttons and see what each does when the agent cuts a corner:

<div class="systems-widget"></div>
<script src="{{ A }}/systems-widget.js"></script>

<div markdown="1" class="tbl-wide" style="overflow-x:auto">

| | What it is | Order set by | Can refuse an action? | Review |
|---|---|---|---|---|
| **AI-DLC** (AWS) | Full lifecycle, 33 stages | <span class="k-engine">State machine</span> | <span class="k-hook">Yes, hooks</span> | 2 reviewer agents; review freeze |
| **feature-dev** (Anthropic) | 7-phase plugin for one feature | <span class="k-prompt">Prompt</span> | No hooks | 3 reviewers; report only findings rated ≥ 80/100 |
| **Code Review** (Anthropic) | Automatic review on each PR | Runs on every PR | No; never approves a PR | Parallel agents, verified, ranked |
| **Spec Kit** (GitHub/Microsoft) | Spec → plan → tasks → implement | <span class="k-prompt">Prompt</span> + checklists | Not built in; extensions can add tool-call hooks | Checklists; an analyze step |
| **Codex plugin** (OpenAI) | Codex inside Claude Code | You, or a Stop hook | <span class="k-hook">Yes, optional review gate</span> | A second model reviews |
| **Conductor** (Google) | Context → spec and plan → implement | <span class="k-prompt">Prompt</span> + plan file | No hooks | Tests first; manual check per phase |

</div>

<p class="fig-cap">Sources: <a href="#ref-1">[1]</a>, <a href="#ref-14">[14]</a>, <a href="#ref-8">[8]</a>, <a href="#ref-15">[15]</a>, <a href="#ref-12">[12]</a>, <a href="#ref-16">[16]</a>.</p>

What strikes me is how much everyone agrees on. Plan before you code, split the work among specialists, review it, keep the state in files rather than in the model's head. The real disagreement is about *where the rule lives*. The labs mostly ship small, composable pieces and trust the model to follow them. AWS ships an entire methodology and backs the rules that matter with code.

That also puts AI-DLC in some tension with the labs' own advice. Anthropic and OpenAI both say to start with the simplest thing that works [[17]](#ref-17)[[18]](#ref-18). AI-DLC does offer light profiles, but the framework underneath is large, and its release notes regularly warn of breaking changes [[5]](#ref-5). For a regulated team that needs an audit trail, that's a fair price. For one developer fixing a bug, it's a steep one.

---

## 5. What a state machine can't give you {#limits}

None of this makes the agent fully reliable, and it's worth being precise about the gaps.

The model still drives the loop. Hooks can refuse a bad action, but they can't make Claude call the engine in the first place. In autonomous or unattended runs, a Stop hook sends an agent that quits early back to work with "AI-DLC is carrying on" [[2]](#ref-2); when you're at the keyboard, an early stop simply pauses the work until you return. Either way it's a nudge, not a guarantee. Hooks also only see tool calls, so anything the agent merely *says* in chat goes unchecked.

The bigger gap is the definition of "done". A process can be followed perfectly and still ship a bug if the last check never looks at the running software. Here is one bug, borrowed from AI-DLC's own documentation, against five kinds of check:

<div class="done-widget"></div>
<script src="{{ A }}/done-widget.js"></script>

AI-DLC is better here than I expected. Its Build and Test stage only counts a browser requirement as met if a real browser ran the check; otherwise it records the result as "Unverified" instead of passing it [[19]](#ref-19). Anthropic reached the same conclusion from the other side: left alone, agents tend to declare a feature finished after unit tests, and only end-to-end testing catches what those miss [[20]](#ref-20).

---

## 6. Where this leaves us {#closing}

The pattern I take from AI-DLC is less about software lifecycles than about where to put trust. Let the model do what models are good at: reading a codebase, asking good questions, writing the code. Take away the decisions where a lapse is costly and easy to rationalise, such as what happens next, whether a plan was really approved, or whether a review still applies. Give those to a program with a memory, and let it say no.

That's also the most transferable idea for anyone building agents outside software, in domains where an out-of-order step is more than an inconvenience. The instructions can stay as rich as you like. Just don't let them be the only thing between the agent and a step it shouldn't take.

---

## Cite this post

<div class="cite">
<pre id="bibtex">@misc{moniruzzaman2026reliableagents,
  author       = {Monir Moniruzzaman},
  title        = {Reliable Coding Agents Through a State Machine: AI-DLC},
  year         = {2026},
  month        = nov,
  howpublished = {\url{https://monirzaman.github.io/reliable-coding-agents-state-machine-ai-dlc/}}
}</pre>
<button type="button" data-copy="#bibtex">Copy BibTeX</button>
</div>

---

## References

<a id="ref-1"></a>[1] AWS Labs. [awslabs/aidlc-workflows](https://github.com/awslabs/aidlc-workflows): README and the plan-approval guard, `core/hooks/aidlc-plan-approval-guard.ts`. Accessed November 7, 2026.

<a id="ref-2"></a>[2] AWS Labs. [The `/aidlc` skill for Claude Code](https://github.com/awslabs/aidlc-workflows/blob/main/harness/claude/skills/aidlc/SKILL.md).

<a id="ref-3"></a>[3] AWS Labs. [Workflow Profiles](https://github.com/awslabs/aidlc-workflows/blob/main/docs/guide/workflow-profiles.md) and [Scopes, Depth, and Test Strategy](https://github.com/awslabs/aidlc-workflows/blob/main/docs/guide/05-scopes-and-depth.md), AI-DLC user guide.

<a id="ref-4"></a>[4] W. Matos, R. Jain, S. Jog, Raja SP. [Open-sourcing adaptive workflows for AI-Driven Development Life Cycle (AI-DLC)](https://aws.amazon.com/blogs/devops/open-sourcing-adaptive-workflows-for-ai-driven-development-life-cycle-ai-dlc/). AWS DevOps Blog, November 29, 2025.

<a id="ref-5"></a>[5] AWS Labs. [AI-DLC changelog](https://github.com/awslabs/aidlc-workflows/blob/main/CHANGELOG.md), through version 2.11.3 (November 4, 2026).

<a id="ref-6"></a>[6] AWS Labs. [Claude Code settings and hooks](https://github.com/awslabs/aidlc-workflows/blob/main/harness/claude/settings.json).

<a id="ref-7"></a>[7] AWS Labs. [CLI commands: Guard Policy](https://github.com/awslabs/aidlc-workflows/blob/main/docs/guide/12-cli-commands.md).

<a id="ref-8"></a>[8] SD Times. [Anthropic brings code review into Claude Code](https://sdtimes.com/ai/anthropic-brings-code-review-into-claude-code/). March 9, 2026. See also the [Code Review documentation](https://code.claude.com/docs/en/code-review).

<a id="ref-9"></a>[9] Help Net Security. [New Claude tool uses AI agents to find bugs in pull requests](https://www.helpnetsecurity.com/2026/03/10/anthropic-claude-code-review/). March 10, 2026.

<a id="ref-10"></a>[10] AWS Labs. [Review-freeze guard](https://github.com/awslabs/aidlc-workflows/blob/main/core/hooks/aidlc-review-freeze.ts), AI-DLC repository.

<a id="ref-11"></a>[11] AWS Labs. [Reviewer-scope guard](https://github.com/awslabs/aidlc-workflows/blob/main/core/hooks/aidlc-reviewer-scope.ts), AI-DLC repository.

<a id="ref-12"></a>[12] OpenAI. [Codex plugin for Claude Code](https://github.com/openai/codex-plugin-cc) (README and `hooks/hooks.json`). Accessed November 7, 2026.

<a id="ref-13"></a>[13] AWS Labs. [Phases and Stages](https://github.com/awslabs/aidlc-workflows/blob/main/docs/guide/04-phases-and-stages.md), AI-DLC user guide.

<a id="ref-14"></a>[14] Anthropic. [feature-dev plugin](https://github.com/anthropics/claude-plugins-official/tree/main/plugins/feature-dev), claude-plugins-official repository.

<a id="ref-15"></a>[15] GitHub. [github/spec-kit](https://github.com/github/spec-kit): README, command templates and extension docs. Accessed November 7, 2026.

<a id="ref-16"></a>[16] Google. [gemini-cli-extensions/conductor](https://github.com/gemini-cli-extensions/conductor), version 0.3.0. See also [InfoQ](https://infoq.com/news/2026/01/google-conductor/), January 2026.

<a id="ref-17"></a>[17] E. Schluntz, B. Zhang. [Building effective agents](https://www.anthropic.com/research/building-effective-agents). Anthropic, December 2024.

<a id="ref-18"></a>[18] OpenAI. A practical guide to building agents, 2025, as summarised by [Maginative](https://www.maginative.com/article/how-to-build-ai-agents-a-detailed-practical-guide-from-openai/).

<a id="ref-19"></a>[19] AWS Labs. [Build and Test stage](https://github.com/awslabs/aidlc-workflows/blob/main/core/aidlc-common/stages/construction/build-and-test.md).

<a id="ref-20"></a>[20] Anthropic. [Effective harnesses for long-running agents](https://anthropic.com/engineering/effective-harnesses-for-long-running-agents). November 26, 2025.

<a id="ref-21"></a>[21] GitHub Docs. [About protected branches](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches): "Dismiss stale pull request approvals when new commits are pushed."

<script src="{{ A }}/post-enhance.js"></script>
