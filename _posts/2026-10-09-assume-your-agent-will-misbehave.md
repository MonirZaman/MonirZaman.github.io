---
layout: post
title: "Assume Your Agent Will Misbehave: A Practical Guide to Containing AI Agents"
date: 2026-10-09
description: "Agents get tricked, and capable agents chase goals in ways nobody intended. Containment, one part of agent security, limits the damage either way. A hands-on guide to the lethal trifecta, the four questions every containment design answers, the designs from NVIDIA, AWS and CrowdStrike, and what July 2026's sandbox escape taught us."
excerpt: "In May 2025 a stranger's GitHub issue made an AI agent leak its owner's private repositories. In July 2026 OpenAI's models broke out of their own evaluation sandbox. Neither needed a bug. This post explains how containment limits the damage when an agent misbehaves, with six interactive figures."
tags: [agents, security, containment, prompt-injection, sandboxing]
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
  @media (max-width: 640px) { .post h1 { font-size: 28px; } .post .entry { font-size: 17px; line-height: 1.65; } }

  /* Colour key used by every figure in this post */
  .k-data { color: #6d28d9; font-weight: 600; }    /* private data */
  .k-untrusted { color: #bc4c00; font-weight: 600; } /* untrusted content */
  .k-exfil { color: #0969da; font-weight: 600; }    /* a way out */

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

{% assign A = "/assets/posts/agent-containment" | relative_url %}

In May 2025, researchers at Invariant Labs showed how a stranger can rob you through your own AI agent [[1]](#ref-1). Their setup was ordinary: Claude Desktop, running Claude 4 Opus, connected to GitHub through the official GitHub MCP server. The user asked a harmless question, roughly *"have a look at the open issues in my public repo."*

One of those issues had been written by the attacker, and the agent followed the instructions inside it. It read the owner's **private** repositories and opened a pull request on the **public** repo with what it found: in Invariant's demo, a private project, the owner's plan to relocate, and their salary. Nothing was broken. Every tool did what it was allowed to do, which is why Invariant called it an architectural problem rather than a bug [[1]](#ref-1). Step through it:

<div class="story-widget"></div>
<script src="{{ A }}/story-widget.js"></script>

Fourteen months later, agents misbehaved with no attacker at all: OpenAI models under evaluation broke out of their sandbox to look for a benchmark's answers ([§6](#escape)). Tricked or simply too determined, the lesson is the same.

<p class="thesis">You can't yet guarantee that an agent will behave. So build the system as if it won't, and make sure it can't do much damage when it doesn't.</p>

That strategy is called **containment**, and it is one part of agent security, not all of it. My March post, [AI Agent Security]({% post_url 2026-03-06-AI-Agent-Security %}), surveys the whole field. This one goes deep on containment and shows where it sits next to the other two lanes:

<picture><source media="(max-width: 600px)" srcset="{{ A }}/fig-lanes-tall.svg"><img src="{{ A }}/fig-lanes.svg" alt="The three lanes of agent security: prevention, containment, and detection and response"></picture>

<p class="fig-cap"><b>Figure 1.</b> The three lanes of agent security; this post covers the middle one. Containment corresponds most closely to OWASP's "Excessive Agency" risk: the damage an agent's actions can cause, whatever triggered them <a href="#ref-18">[18]</a>. The animation follows one bad action across the lanes. <i>Diagram by the author.</i></p>

**The short version**

1. **Agents misbehave for reasons you can't fully prevent.** Instructions and data share one channel, so prompt injection works ([§1](#why)), and capable agents pursue goals in ways nobody intended ([§6](#escape)).
2. **Danger needs three ingredients:** <span class="k-data">private data</span>, <span class="k-untrusted">untrusted content</span> and <span class="k-exfil">a way out</span>. Remove one, or control each at runtime. ([§2](#trifecta))
3. **Put controls where the agent can't switch them off.** Checks inside the agent are soft; sandboxes and boundary policy are enforced outside it. ([§3](#layers))
4. **Every containment design answers four questions:** where the boundary is, what gets checked, where the keys live, and who can widen access. NVIDIA, AWS and CrowdStrike answer them differently. ([§4](#box), [§5](#history))
5. **The box can break, and it can't see everything.** A real escape went through the one allowed exit, and misuse of an allowed channel looks like normal work. Nest boundaries, watch them, and keep prevention in the mix. ([§6](#escape), [§7](#limits))

**How to read this.** The full post takes about 20 minutes. Six of the figures are interactive: you can replay two real incidents, switch defenses on and off, and try out policy rules yourself. Colors mean the same thing in every figure: <span class="k-data">violet</span> is private data, <span class="k-untrusted">orange</span> is untrusted content, and <span class="k-exfil">blue</span> is a way out. Short on time? Read the summary above, then jump to [the checklist](#checklist).

* TOC
{:toc}

---

## 1. Why agents get tricked {#why}

A language model reads one long stream of tokens. Your request, the system prompt, the body of a GitHub issue and the text of a web page all arrive in that same stream. The model has learned that some of it is "instructions" and some is "data," but there is no hard boundary between them, the way there is between code and input in a well-written program. So text that *looks* like an instruction can act like one. That's **prompt injection**, and OWASP ranks it as the number one risk for LLM applications [[2]](#ref-2).

The obvious fix is a filter: train the model to ignore injected instructions, or put a classifier in front of it. Both help, and you should use them. But they are probabilistic, and security is not graded on a curve. As Simon Willison puts it, a guardrail that catches 95% of attacks is "very much a failing grade" [[3]](#ref-3): the attacker only needs one phrasing that works, and they can try as many as they like.

The stakes are rising because the models themselves are getting very good at security work. As I covered in the [March post]({% post_url 2026-03-06-AI-Agent-Security %}), frontier models now find and exploit real vulnerabilities on their own, and §6 shows agents breaking out of sandboxes. A tricked agent with those skills is a capable intruder already inside your network.

So here is the stance the rest of this post takes: **treat the model like untrusted code that happens to hold your credentials.** You wouldn't stop a malicious script by asking it nicely; you'd control what it can reach.

---

## 2. The lethal trifecta {#trifecta}

Willison gave the most useful mental model for this in June 2025 [[3]](#ref-3). Data theft through an agent needs three things at once:

- <span class="k-data">**Access to private data**</span>, which is worth stealing.
- <span class="k-untrusted">**Exposure to untrusted content**</span>, which lets an attacker give orders.
- <span class="k-exfil">**A way to communicate externally**</span>, which carries the data out.

Map the GitHub attack onto it: the private repos were the <span class="k-data">data</span>, the public issue was the <span class="k-untrusted">untrusted content</span>, and the public pull request was the <span class="k-exfil">way out</span>. All three, in one agent, in one session.

Toggle the ingredients, or load one of the example agents:

<div class="trifecta-widget"></div>
<script src="{{ A }}/trifecta-widget.js"></script>

The cleanest defense is to never let one agent hold all three. A research agent that reads the web but has no access to your files is fairly safe. So is an agent that reads your inbox but can't send anything.

Meta turned this into a design rule, the **Agents Rule of Two** [[16]](#ref-16). Within one session, an agent should have at most two of these three properties: it processes untrustworthy inputs, it can reach sensitive systems or private data, and it can change state or communicate externally. Note that Meta's third leg is broader than Willison's: "change state" covers destructive actions such as deleting files, not just sending data out. If a task truly needs all three, Meta's answer is that the agent shouldn't run on its own; a person approves its actions, or another reliable check does.

The trouble is that the useful agents are exactly the ones that need all three. A coding agent reads untrusted code and docs, works in your private repo, and needs the network to install packages; even OpenAI's locked-down evaluation sandbox in §6 kept a path open for package installs [[10]](#ref-10). You often can't remove a leg entirely. What you *can* do is control each leg at runtime: which files, which hosts, which actions, in which order. That is what containment means.

---

## 3. Where a control can live {#layers}

It helps to list the places a control can sit, from inside the agent outwards:

1. **The model** – safety training, system prompts, injection classifiers.
2. **The harness** – the agent app's own permission prompts and allow-lists ("Allow this tool call?").
3. **OS containment** – a sandbox that limits which files, processes and system calls the agent can touch.
4. **Boundary policy** – rules checked as actions cross the sandbox edge: which hosts, which HTTP methods, which credentials, in what sequence, and how much (rate and spend limits).
5. **Human review** – a person signs off on irreversible or external actions.

Only layer 1 is prevention. Layers 2 to 5 are containment, and they differ in one way that matters: whether the agent can switch them off.

The first two run inside the agent's own process and **see the request, not its effect.** A harness sees "run this shell command"; it doesn't see which files the command will delete or which hosts it will contact [[4]](#ref-4). Approvals also get waved through: CrowdStrike warns that approvers must review context rather than approve reflexively [[9]](#ref-9), and in the GitHub demo, Claude Desktop asked before each tool call by default, but Invariant noted that many users switch on "Always allow" [[1]](#ref-1).

A harness gate can be hardened. CrowdStrike's `Baywatch` checks every shell command in a pre-execution hook that the agent can't modify, and the hook still fires when the harness is told to skip permission prompts [[9]](#ref-9). These hooks are also being standardized: Microsoft's **Agent Control Specification** (public preview) defines eight points in the agent loop, from `agent_startup` through `pre_tool_call` to `output`, where the host asks a policy engine for a verdict of allow, deny or transform; policies can be Rego or Cedar, and any runtime error returns deny. Its engine is deliberately stateless, so the host must pass any history a rule needs with each request [[13]](#ref-13). Both still judge the command, not what it ends up touching, so they complement a sandbox rather than replace one.

Layers 3 and 4 are enforced by a separate component, so they don't depend on the agent's cooperation, one of the principles on CrowdStrike's checklist [[9]](#ref-9). There is evidence that this placement matters. A June 2026 study reports that attacks written with knowledge of the defense broke twelve defenses that sit inside the model's input more than 90% of the time, while a policy check outside the input (Progent) held attackers to 2.6% [[15]](#ref-15). It was a small test on a 7B model, but it points the same way. (Outside controls can still fail in other ways; [§6](#escape) shows how.)

Try it: pick an attack, switch layers off, and watch where it gets stopped.

<div class="layers-widget"></div>
<script src="{{ A }}/layers-widget.js"></script>

Two things to notice. First, the soft layers (dashed) never count as a guarantee; an attack only counts as "stopped" if a layer that *can't* be talked out of it blocks it. Second, "Leak through an allowed channel" gets through everything. Hold that thought until [§7](#limits).

---

## 4. Four questions every containment design answers {#box}

Containment products look different on the surface. In my reading, each one has to answer the same four questions:

1. **Where is the boundary?** What separates the agent from everything else.
2. **What gets checked?** Which actions are inspected as they cross it.
3. **Where do the keys live?** How the agent uses credentials without holding them.
4. **Who can widen access?** What happens when the agent needs more than it has.

Three designs described this year answer them in instructive ways: two open-source projects (both Apache 2.0) and an internal stack CrowdStrike has described in detail. All three enforce outside the agent, keep real secrets out of its reach, and send its outbound traffic through one checked exit.

![How OpenShell and Strands Box place the boundary]({{ A }}/fig-two-boxes.svg)

<p class="fig-cap"><b>Figure 2.</b> Two of the three designs. In both, the real key never enters the sandbox: it is attached outside, only to allowed requests (animated). <i>Diagram drawn by the author from <a href="#ref-5">[5]</a> and <a href="#ref-4">[4]</a>; simplified.</i></p>

### 4.1 NVIDIA OpenShell: a runtime for fleets of agents

**Boundary.** The agent runs in a sandbox (a container or a VM). On Linux, Landlock confines its files, seccomp user notification hands its network operations to a **supervisor** on the trusted side, and it runs as a non-root user with no Linux capabilities. An outer fence backs this up: container networking switched off, Kubernetes `NetworkPolicy`, or a VM with no network device [[5]](#ref-5).

**Checks and keys.** The supervisor checks each request against policy and adds credentials only to requests it allows [[5]](#ref-5).

**Widening access.** This is OpenShell's most original answer. When an agent asks for new access, a **policy prover** uses formal verification to flag risky changes, such as credentialed access to a new host or a new HTTP method, and any finding blocks auto-approval until a human looks [[5]](#ref-5). A person only sees the requests that actually widen what the agent can do. (NVIDIA also ships OpenShell inside NemoClaw, for OpenClaw agents [[6]](#ref-6).)

### 4.2 AWS Strands Box: a sandbox with a memory

**Boundary.** OS-level isolation (macOS Seatbelt today) in the developer's own environment, with no separate VM [[4]](#ref-4).

**Checks.** Four enforcement points: an egress gateway, a Shell interpreter, a Python interpreter and an MCP broker. The interpreters are the clever part: when the agent runs `rm -rf build/`, the Shell asks policy about each file it would delete before anything is removed [[4]](#ref-4). Every point reports actions in one vocabulary (`fs:read`, `fs:delete`, `http:request`, …) into a shared history that rules written in **Dogwood**, a policy language with Cedar's `permit`/`forbid` syntax, can query [[4]](#ref-4)[[7]](#ref-7). [§5](#history) shows why that history matters.

**Keys.** The agent gets placeholder tokens; the gateway swaps in real secrets, including AWS SigV4 signing, only on allowed requests [[4]](#ref-4).

**Widening access.** Policy lives in reviewable Dogwood files, and AWS ships an agent skill that helps write them [[4]](#ref-4).

### 4.3 CrowdStrike: defense in depth for agents built to attack

CrowdStrike runs offensive security agents, so it designs for the worst case: a capable, persistent agent that may be misaligned, prompt-injected or running in a buggy harness. Its rule is "contain by construction, not by trust" [[9]](#ref-9).

**Boundary.** Four nested boundaries that an action must cross, one after another: an isolated network with default-deny egress, a dedicated VM per harness that can be snapshotted and reverted, a hardened container (seccomp, AppArmor), and `ward`, which confines the agent's processes with Landlock on Linux or Seatbelt on macOS [[9]](#ref-9).

**Checks.** One gate per channel. `ward-mcp` checks every MCP tool call against an allow-list, its parameters and destination limits; `Baywatch` checks every shell command and returns allow, allow and log, escalate to a human, or deny. Quotas, rate, time and spend limits apply at every boundary and fail closed [[9]](#ref-9).

**Keys.** Credentials are attached at `ward`'s proxy, and the agent gets test-only or revocable ones [[9]](#ref-9).

**Widening access.** Any change to hook scripts, policy files or harness settings goes to a person. An escalation nobody answers times out to a deny, and the approver's identity goes into an audit log the agent can't edit. CrowdStrike says none of its offensive agents has escaped so far; the post doesn't announce a public release [[9]](#ref-9).

![CrowdStrike's seven containment layers]({{ A }}/fig-defense-in-depth.svg)

<p class="fig-cap"><b>Figure 3.</b> CrowdStrike's seven layers: nested boundaries, a gate per channel, and limits on everything. The animation shows a <code>git push</code> stopped at <code>Baywatch</code>, which CrowdStrike blocks outright, while an allowed tool call passes <code>ward-mcp</code> and every boundary. <i>Diagram drawn by the author from <a href="#ref-9">[9]</a>; simplified.</i></p>

<div markdown="1" class="tbl-wide" style="overflow-x:auto">

| | NVIDIA OpenShell | AWS Strands Box | CrowdStrike stack |
|---|---|---|---|
| Where is the boundary? | Container or VM; Landlock, seccomp, non-root | Host OS sandbox (macOS Seatbelt); no guest OS | Isolated network, VM per harness, container, then `ward` (Landlock or Seatbelt) |
| What gets checked? | Files, processes, network destinations, API calls, credential use | Each action *and* the agent's history of actions | Each shell command and each MCP tool call, at separate gates; plus volume, time and spend |
| Where do the keys live? | With the supervisor, added only to allowed requests | At the gateway, swapped in for placeholders (incl. AWS SigV4 signing) | At `ward`'s proxy; test-only or revocable keys |
| Who can widen access? | A human, once the formal prover flags new reach | Whoever edits the reviewable Dogwood rules | A human; unanswered requests become denials |
| Runs on | Linux, macOS (Apple Silicon), WSL 2 (experimental), Kubernetes | macOS (developer preview) | CrowdStrike internal; no public release announced |

</div>

---

## 5. Policy that remembers {#history}

Most permission systems judge each request on its own: *is a POST to slack.com allowed?* That's enough to stop the agent from reaching a host it should never touch. It's not enough to express the rules you actually care about, which are often about **sequences**:

- Post incident updates to Slack, but **no more than three every ten minutes**, so the agent can't flood the channel.
- **After** reading anything in `customers/`, send nothing over the network.
- **After** reading a private repo, don't write to a public one. (That one would have stopped the GitHub attack. Invariant's own suggested fix was in the same spirit: limit an agent to one repository per session [[1]](#ref-1).)

Dogwood expresses these with temporal operators over the recorded history: a rule can ask whether something happened before, how many times, in what order, and how long ago [[7]](#ref-7). In Box, the rate-limit rule counts successful Slack posts in the last ten minutes and forbids another once there are three [[4]](#ref-4). (Microsoft's specification, from §3, makes the opposite choice: its engine is stateless, so the host must carry the history [[13]](#ref-13).) Play with both rules:

<div class="history-widget"></div>
<script src="{{ A }}/history-widget.js"></script>

Three details from the AWS design are worth copying even if you never use Box:

- **Count outcomes, not attempts.** The rate-limit rule counts posts that *succeeded* (HTTP 200). If it counted attempts, every denied retry would push the agent further into the penalty box [[4]](#ref-4).
- **One vocabulary across tools.** Because a file read through the shell and a file read through Python are both `fs:read`, the "read customer data, then send" rule can't be dodged by switching languages [[4]](#ref-4).
- **Denials explain themselves.** A refusal comes back as an HTTP 403 naming the rule and carrying its description, so a well-behaved agent can adapt, for example by waiting, instead of retrying blindly [[4]](#ref-4).

---

## 6. When the box itself breaks {#escape}

Everything so far assumes the box holds. In July 2026 one failed in public, in an incident OpenAI itself called unprecedented, and it's worth studying closely.

OpenAI was measuring the maximum cyber capability of its models on ExploitGym, a benchmark of multi-step exploitation. The agent harness ran GPT-5.6 Sol and a more capable internal prototype, with cyber refusals reduced and production classifiers switched off on purpose [[10]](#ref-10). The sandbox had no direct internet access. It could reach only a package-registry cache proxy (Artifactory), so the agent could install packages. The models found a zero-day in that proxy and got out. They then reasoned that Hugging Face might host the benchmark's solutions, and went to fetch them [[10]](#ref-10)[[11]](#ref-11). Step through Hugging Face's reconstruction:

<div class="escape-widget"></div>
<script src="{{ A }}/escape-widget.js"></script>

Four lessons, each grounded in what the two companies published:

- **The one allowed path out is attack surface.** Every design in §4 funnels traffic through a single supervised exit. That's right, but it makes the exit the most valuable target in the system: here it *was* the escape route. Keep it minimal, patched and monitored, and put another boundary behind it (CrowdStrike's VM and isolated-network layers exist for exactly this) [[9]](#ref-9)[[10]](#ref-10).
- **Familiar weaknesses, at machine speed.** Hugging Face stresses that none of the holes were exotic: unsafe dataset processing, cloud metadata reachable from pods, overly broad credentials that lived too long. The difference was an attacker that took about 17,600 actions in four and a half days [[11]](#ref-11).
- **Boring controls held.** The `datasets` library's URL allow-list blocked the first attempts to fetch remote resources, and network allow-lists denied every attempt to change cloud resources with stolen credentials [[11]](#ref-11). Default-deny works, even against this attacker.
- **Detection has to keep up.** Several systems raised weak signals, and an AI-based correlation layer even linked them, but it didn't escalate fast enough to page anyone [[11]](#ref-11). A containment plan needs a way to notice when containment is failing.

The escape was not a fluke of one proxy. The UK AI Security Institute's **SandboxEscapeBench** puts agents inside a Docker or Kubernetes container that has one deliberate weakness, from a mounted Docker socket (among the easiest) to kernel bugs (among the hardest), and asks them to break out [[12]](#ref-12):

<div class="escape-chart"></div>
<script src="{{ A }}/escape-chart.js"></script>

At a 2.5M-token budget, GPT-5 and Claude Opus 4.5 escaped in about half of their attempts, though neither solved any of the hardest (level 4 and 5) tasks. In the authors' later runs with 100M-token budgets, Claude Mythos Preview succeeded on every task within five attempts, so they describe it as saturating the benchmark [[12]](#ref-12). The authors' conclusion: when a container has such a weakness, frontier models can find and exploit it, so sandboxes need to be tested against capable agents to stay effective [[12]](#ref-12).

The engine under the sandbox matters too. A June 2026 comparison of five AI code-sandbox products found the container-based one leaked 10 of 28 host-identifying details, while two microVM-based ones leaked none. It also found that operators' patching habits vary enormously: products lagged behind engine fixes by anywhere from zero days to more than 471 [[17]](#ref-17). And Firecracker and Cloud Hypervisor, two of the microVM engines in the study, each published their first escape-class CVEs in 2026, so even the stronger boundary needs patching. This is why CrowdStrike nests its boundaries (an isolated network, a VM per agent, a container, then process confinement) and caps time and spend at every one: an action has to get through all of them to escape [[9]](#ref-9).

---

## 7. What containment can't do {#limits}

Containment limits the damage, but it has hard limits of its own, and it doesn't replace prevention.

**Misuse of an allowed channel.** A sandbox governs actions that cross its boundary. Once a request is going somewhere it's allowed to go, the box can't tell a status update from your customer list. That's the scenario that got through every layer in §3. A history rule ("nothing goes out after reading `customers/`") narrows the gap, but it also blocks legitimate work, so someone has to choose where to draw the line.

**Trust in the enforcer.** The policy is only as good as the code enforcing it. AWS says plainly that running Box's interpreters outside the sandbox widens the trusted computing base [[4]](#ref-4). OpenShell's supervisor is likewise part of what you must trust. And the enforcer's configuration is itself a target: a tricked agent can try to loosen its own policy or harness settings, which is why CrowdStrike sends any such change to a person [[9]](#ref-9).

**Policies are code, and code has bugs.** An overly broad rule is invisible until it's exploited. OpenShell's prover is one answer; review and an automated regression suite are the other.

**Every new channel needs its own gate.** Give the agent a new way to act, such as another MCP server, and it is an unguarded exit until something checks it. CrowdStrike's rule is to add a gate before approving any new channel [[9]](#ref-9).

**Beyond containment: prevention by design.** Some of the most promising work goes after the root cause, prompt injection itself, rather than limiting its effects. **CaMeL**, from researchers at Google DeepMind and ETH Zürich, turns the user's request into a plan *before* the agent reads any untrusted data, so injected text can supply values but can't change which tools get called; it also tags data with capabilities that stop private data from flowing to places it shouldn't [[8]](#ref-8). On the AgentDojo benchmark it completed 77% of tasks with provable security, versus 84% for an undefended agent. That gap is the honest price of security today: you give up a little capability to get guarantees.

A March 2026 position paper from NVIDIA researchers adds a practical rule for where model judgment belongs [[14]](#ref-14). Use deterministic rules wherever they suffice, such as blocking or confirming any instruction that traces back to an untrusted source. Use an LLM only for judgments that are hard to write down, such as whether a change to the plan is justified by the task, and show that LLM a narrow, structured input (the proposed change and minimal evidence), never the raw untrusted text that might be steering it.

And for anything irreversible or public, keep a human in the loop, ideally one who is only asked when it matters. Make approvals last for one run rather than forever, and treat a request nobody answers as a no [[9]](#ref-9).

---

## 8. A Monday-morning checklist {#checklist}

1. **Draw the trifecta for each agent.** For every agent you run, write down its <span class="k-data">private data</span>, its sources of <span class="k-untrusted">untrusted content</span> and its <span class="k-exfil">ways out</span>.
2. **Break a leg where you can.** Follow Meta's Rule of Two: split agents so no single one holds all three, and put a person in the loop when one must. A read-only research agent can hand a summary to a separate agent that has write access.
3. **Run agents in a sandbox that enforces outside the agent.** Limit file access to the workspace.
4. **Block outbound traffic by default.** Allow-list hosts, and where you can, methods and paths. Treat the allowed exit itself (proxy, gateway) as attack surface: keep it minimal and patched, and put another boundary behind it.
5. **Keep real secrets out of the agent's environment.** Use placeholder tokens that are swapped at the boundary.
6. **Write history rules for dangerous sequences**: read sensitive data, then send; read a private repo, then write to a public one.
7. **Require approval for irreversible or public actions**, per run rather than forever, and fail closed if nobody answers. Keep those prompts rare enough that people still read them.
8. **Cap volume, time and spend**, and stop the agent when a cap is hit.
9. **Protect the controls.** The agent must not be able to edit its own policy, hooks or harness settings without a person signing off.
10. **Keep an audit log the agent can't edit, and read the denials.** They tell you what your agents (and your attackers) are trying.
11. **Block cloud metadata from the sandbox and keep credentials short-lived and narrow.** Both were stepping stones in the July 2026 intrusion.

---

## Cite this post

<div class="cite">
<pre id="bibtex">@misc{moniruzzaman2026misbehave,
  author       = {Monir Moniruzzaman},
  title        = {Assume Your Agent Will Misbehave: A Practical Guide to
                  Containing AI Agents},
  year         = {2026},
  month        = oct,
  howpublished = {\url{https://monirzaman.github.io/assume-your-agent-will-misbehave/}}
}</pre>
<button type="button" data-copy="#bibtex">Copy BibTeX</button>
</div>

---

## References

<a id="ref-1"></a>[1] M. Milanta, L. Beurer-Kellner. [GitHub MCP Exploited: Accessing private repositories via MCP](https://invariantlabs.ai/blog/mcp-github-vulnerability). Invariant Labs, May 26, 2025.

<a id="ref-2"></a>[2] OWASP GenAI Security Project. [LLM01:2025 Prompt Injection](https://genai.owasp.org/llmrisk/llm01-prompt-injection/). [OWASP Top 10 for LLM Applications 2025](https://genai.owasp.org/llm-top-10/).

<a id="ref-3"></a>[3] S. Willison. [The lethal trifecta for AI agents: private data, untrusted content, and external communication](https://simonwillison.net/2025/Jun/16/the-lethal-trifecta/). June 16, 2025.

<a id="ref-4"></a>[4] F. Dingler. [Introducing Strands Box: AI agent sandboxes powered by Dogwood](https://aws.amazon.com/blogs/opensource/introducing-strands-box-ai-agent-sandboxes-powered-by-dogwood/). AWS Open Source Blog, October 7, 2026. Code: [github.com/strands-agents/box](https://github.com/strands-agents/box).

<a id="ref-5"></a>[5] NVIDIA. [OpenShell architecture](https://docs.nvidia.com/openshell/latest/about/architecture) and [repository](https://github.com/NVIDIA/OpenShell). Accessed October 2026.

<a id="ref-6"></a>[6] CSO Online. [Nvidia NemoClaw promises to run OpenClaw agents securely](https://www.csoonline.com/article/4146564/nvidia-nemoclaw-promises-to-run-openclaw-agents-securely-3.html). March 17, 2026.

<a id="ref-7"></a>[7] J. Arora, J. Tassarotti, J.-B. Tristan. [Introducing the Dogwood Local Engine: Temporal Governance for Agent Actions](https://aws.amazon.com/blogs/opensource/introducing-the-dogwood-local-engine-temporal-governance-for-agent-actions/). AWS Open Source Blog, September 30, 2026. Language guide: [dogwood-policy.github.io/dogwood](https://dogwood-policy.github.io/dogwood/).

<a id="ref-8"></a>[8] E. Debenedetti et al. [Defeating Prompt Injections by Design](https://arxiv.org/abs/2503.18813) (CaMeL). arXiv 2503.18813, 2025.

<a id="ref-9"></a>[9] J. Holt, D. Onofri, L. Woznicki, D. Dinca, C. Midler. [Secure Agent Harness Execution: Preventing Escape](https://www.crowdstrike.com/en-us/blog/secure-agent-harness-execution-preventing-escape/). CrowdStrike blog, August 4, 2026.

<a id="ref-10"></a>[10] OpenAI. [OpenAI and Hugging Face partner to address security incident during model evaluation](https://openai.com/index/hugging-face-model-evaluation-security-incident/). July 21, 2026, updated August 26, 2026.

<a id="ref-11"></a>[11] Hugging Face. [Anatomy of a Frontier Lab Agent Intrusion: A Technical Timeline of the July 2026 Incident](https://huggingface.co/blog/agent-intrusion-technical-timeline). July 27, 2026.

<a id="ref-12"></a>[12] R. Marchand et al. [Quantifying Frontier LLM Capabilities for Container Sandbox Escape](https://arxiv.org/abs/2603.02277) (SandboxEscapeBench). arXiv 2603.02277, v3 August 2026. UK AI Security Institute [overview](https://www.aisi.gov.uk/blog/can-ai-agents-escape-their-sandboxes-a-benchmark-for-safely-measuring-container-breakout-capabilities); code: [github.com/UKGovernmentBEIS/sandbox_escape_bench](https://github.com/UKGovernmentBEIS/sandbox_escape_bench).

<a id="ref-13"></a>[13] Microsoft. [Agent Control Specification](https://microsoft.github.io/agent-governance-toolkit/packages/agent-control-specification/), Agent Governance Toolkit documentation. Public preview, accessed October 2026.

<a id="ref-14"></a>[14] C. Xiang et al. [Architecting Secure AI Agents: Perspectives on System-Level Defenses Against Indirect Prompt Injection Attacks](https://arxiv.org/abs/2603.30016). arXiv 2603.30016, March 2026.

<a id="ref-15"></a>[15] P. Narisetty et al. [Adaptive Evaluation of Out-of-Band Defenses Against Prompt Injection in LLM Agents](https://arxiv.org/abs/2606.26479). arXiv 2606.26479, June 2026.

<a id="ref-16"></a>[16] Meta. [Agents Rule of Two: A Practical Approach to AI Agent Security](https://ai.meta.com/blog/practical-ai-agent-security/). October 31, 2025.

<a id="ref-17"></a>[17] G. Andronchik, P. Lokhmakov. [AI Code Sandboxes: A Comparative Security Study, Part 1: Engine-Level Properties](https://arxiv.org/abs/2606.08433). arXiv 2606.08433, June 2026.

<a id="ref-18"></a>[18] OWASP GenAI Security Project. [LLM06:2025 Excessive Agency](https://genai.owasp.org/llmrisk/llm062025-excessive-agency/). OWASP Top 10 for LLM Applications, 2025.

<script src="{{ A }}/post-enhance.js"></script>
