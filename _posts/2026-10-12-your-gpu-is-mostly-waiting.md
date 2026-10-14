---
layout: post
title: "Interactive Guide to LLM Inference"
permalink: /interactive-guide-to-llm-inference/
date: 2026-10-12
description: "An H100 could compute about 60,000 tokens a second of Llama 3.1 8B, yet serves one user at most about 200. This hands-on guide explains where the time goes, from tokens and Q, K, V to SMs and HBM, prefill and decode, batching, TTFT and TPOT, the KV cache, FlashAttention, speculative decoding, quantization, pruning, multi-GPU serving and inference engines, with fourteen interactive figures."
excerpt: "An H100 can do the arithmetic for about 60,000 tokens a second of Llama 3.1 8B, yet it serves a single user at most about 200. The other 99.7% of the time, it waits for memory. This post explains why, and how every major inference trick follows from it, with fourteen interactive figures."
tags: [llm, inference, gpu, kv-cache, flashattention, speculative-decoding, quantization, pruning, vllm]
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

  /* Colour key used by every figure in this post */
  .k-prefill { color: #0969da; font-weight: 600; } /* prefill, arithmetic */
  .k-decode { color: #bc4c00; font-weight: 600; }  /* decode, memory traffic */
  .k-kv { color: #6d28d9; font-weight: 600; }      /* KV cache */

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
</style>

{% assign A = "/assets/posts/llm-inference" | relative_url %}
<script src="{{ A }}/bench.js"></script>

Here is a number that surprised me the first time I worked it out. An NVIDIA H100 can do about 989 trillion bf16 operations per second [[4]](https://www.nvidia.com/en-us/data-center/h100/ "H100 Tensor Core GPU specifications"). Generating one token with Llama 3.1 8B takes about 16 billion of them, two for each of its 8 billion weights. On paper, the chip could write around **60,000 tokens a second**.

Serve that model to one user and it writes **at most about 200**. The reason is not arithmetic. To produce each token, the GPU has to read almost all 16 GB of weights out of memory, and at 3.35 TB/s [[4]](https://www.nvidia.com/en-us/data-center/h100/ "H100 Tensor Core GPU specifications") that takes about 5 milliseconds. The math itself takes 16 microseconds. For the rest of each step, the arithmetic units sit idle, waiting for bytes.

Step through it and watch the meter. Each pass reads the weights again, and uses well under 1% of the chip's arithmetic:

<div class="decode-widget"></div>
<script src="{{ A }}/decode-widget.js"></script>

<p class="thesis">LLM inference is mostly a fight with memory traffic. Almost every trick either moves fewer bytes per token, or gets more tokens out of every byte it moves.</p>

In 2023 I wrote about [inference for machine-learning models in general]({% post_url 2023-03-06-Machine-Learning-Model-Inference %}): distillation, quantization, pruning, half precision and ONNX Runtime. Those levers still matter, and two of them come back in §8 and §9. What that post didn't cover is what makes LLMs different: they write one token at a time, and that loop changes where the time goes.

The post builds up in the order I'd learn it: what one model call does (§1–2), the hardware it runs on (§3), the numbers that follow from both (§4–5), the techniques that bend those numbers (§6–9), and how it all scales and gets packaged into real engines (§10–11).

* TOC
{:toc}

---

## 1. What happens when you call an LLM {#anatomy}

Before the performance story, it helps to see what one call actually computes. Here is the path a prompt takes through a model like Llama 3.1 8B [[5]](https://arxiv.org/abs/2407.21783 "The Llama 3 Herd of Models")[[36]](https://arxiv.org/abs/1706.03762 "Attention Is All You Need"):

1. **Tokenize.** The text is split into tokens, whole words or pieces of words, and each becomes an ID. Llama 3's vocabulary has 128,256 of them [[5]](https://arxiv.org/abs/2407.21783 "The Llama 3 Herd of Models").
2. **Embed.** Each ID picks a row from an embedding table: a vector of 4,096 numbers that the rest of the model works on.
3. **Run the transformer blocks.** The vectors pass through 32 identical blocks. Each block has two parts:
   - **Self-attention.** Every token produces three vectors: a **query** (Q, what it is looking for), a **key** (K, what it offers) and a **value** (V, what it passes on). A token's query is compared with the keys of every token before it, and the resulting weights decide how much of each value to mix in. This is the only place tokens exchange information.
   - **MLP.** A feed-forward network then transforms each token's vector on its own.
4. **Predict.** The final vector is multiplied by an output head into one score per vocabulary entry. Softmax turns those into probabilities, and a sampler picks the next token. Two knobs shape that choice: **temperature** sharpens or flattens the distribution, and **top-p** discards the unlikely tail. Try both at stage 6 below.
5. **Repeat.** The new token is appended, and the model runs again. This loop is **autoregressive generation**.

Step through it. The bar underneath shows where the model's weights live, and which part each stage uses:

<div class="anatomy-widget"></div>
<script src="{{ A }}/anatomy-widget.js"></script>

Two details from this figure come back again and again. First, most of the weights sit in the MLPs (70% in Llama 3.1 8B, more in the bigger models), and every one of them is used for every token. Second, a token's keys and values are needed again by every later token, but its query is not. That asymmetry is why servers keep a **KV cache** and never a Q cache. If you want to see the same pipeline in 3D, Brendan Bycroft's [LLM visualization](https://bbycroft.net/llm) is wonderful [[35]](https://bbycroft.net/llm "LLM Visualization").

---

## 2. Two phases, one model {#phases}

Every request runs the same weights in two very different ways [[1]](https://llama.app/docs/prefill-vs-decode "Prefill vs. Decode").

In <span class="k-prefill">**prefill**</span>, the model reads your whole prompt in a single forward pass, with all tokens processed in parallel. Along the way, every layer computes the **keys** and **values** from §1 for every prompt token. The model stores them in the <span class="k-kv">**KV cache**</span>, then picks the first token of the answer.

Then <span class="k-decode">**decode**</span> takes over. It's a loop: feed in the token just produced, run the model, pick the next one, repeat until done. Each pass handles one new token per conversation, reuses the cached keys and values for everything before it, and adds one more entry to the cache.

<picture><source media="(max-width: 600px)" srcset="{{ A }}/fig-two-phases-tall.svg"><img src="{{ A }}/fig-two-phases.svg" alt="Prefill reads all prompt tokens in one pass and writes their keys and values; decode runs one pass per token, reading all weights and the whole cache each time"></picture>

<p class="fig-cap"><b>Figure 1.</b> The two phases. Prefill uses the weights once for many tokens; decode reads them again for every single token. <i>Diagram by the author, after <a href="https://llama.app/docs/prefill-vs-decode" title="Prefill vs. Decode">[1]</a>.</i></p>

That difference decides which hardware limit you hit. A matrix multiply over a long prompt reuses each weight hundreds of times once it's loaded, so prefill is limited by how fast the chip can multiply. Decode uses each weight once per token, so it is limited by how fast memory can deliver the weights [[1]](https://llama.app/docs/prefill-vs-decode "Prefill vs. Decode")[[2]](https://vllm.ai/blog/2025-09-05-anatomy-of-vllm "Inside vLLM: Anatomy of a High-Throughput LLM Inference System"). To see why those are two different limits, we need to look inside the GPU.

---

## 3. Inside the GPU: where the bytes live {#gpu}

A GPU is many small processors sharing one large memory. An H100 has 132 **streaming multiprocessors** (SMs). Each SM has its own tensor cores, which do the matrix math, and a small amount of very fast on-chip memory: a 256 KB register file and 256 KB of L1 cache and shared memory, the SRAM that kernels manage by hand. All SMs share a 50 MB L2 cache. The model itself lives off the chip, in 80 GB of **HBM** (high-bandwidth memory) [[30]](https://developer.nvidia.com/blog/nvidia-hopper-architecture-in-depth/ "NVIDIA Hopper Architecture In-Depth")[[4]](https://www.nvidia.com/en-us/data-center/h100/ "H100 Tensor Core GPU specifications").

<picture><source media="(max-width: 600px)" srcset="{{ A }}/fig-gpu-memory-tall.svg"><img src="{{ A }}/fig-gpu-memory.svg" alt="H100 memory hierarchy: 132 SMs, each with tensor cores, 256 KB of registers and 256 KB of L1/shared memory; a 50 MB L2 cache; and 80 GB of HBM connected at 3.35 TB/s"></picture>

<p class="fig-cap"><b>Figure 2.</b> The memory hierarchy of an H100. The closer memory is to the tensor cores, the faster and smaller it is. <i>Diagram by the author from NVIDIA's specifications <a href="https://developer.nvidia.com/blog/nvidia-hopper-architecture-in-depth/" title="NVIDIA Hopper Architecture In-Depth">[30]</a><a href="https://www.nvidia.com/en-us/data-center/h100/" title="H100 Tensor Core GPU specifications">[4]</a>.</i></p>

The gap between the levels is large. The FlashAttention authors estimate that an A100's on-chip SRAM delivers around 19 TB/s, against 1.5–2.0 TB/s for its HBM [[27]](https://arxiv.org/abs/2205.14135 "FlashAttention: Fast and Memory-Efficient Exact Attention with IO-Awareness"). Every byte a kernel needs has to travel from HBM into an SM before a tensor core can touch it.

Horace He's [Making Deep Learning Go Brrrr](https://horace.io/brrr_intro.html) splits the time any GPU program takes into three parts [[26]](https://horace.io/brrr_intro.html "Making Deep Learning Go Brrrr From First Principles"):

- **Compute:** time spent doing math on the tensor cores.
- **Memory bandwidth:** time spent moving data between HBM and the SMs.
- **Overhead:** everything else, such as Python, framework dispatch and kernel launches.

Which one dominates depends on **arithmetic intensity**: how many operations a kernel does for each byte it moves. Divide the chip's peak FLOPS by its bandwidth and you get the **ridge point**, the intensity a kernel needs to keep the tensor cores busy. For an H100 that's 989 ÷ 3.35 ≈ 295 operations per byte [[4]](https://www.nvidia.com/en-us/data-center/h100/ "H100 Tensor Core GPU specifications")[[31]](https://damek.github.io/random/basic-facts-about-gpus/ "Basic facts about GPUs"). Below the ridge, a kernel is **memory-bound**; above it, **compute-bound**. Here are the main operations in an LLM, placed against that line:

<div class="intensity-widget"></div>
<script src="{{ A }}/intensity-widget.js"></script>

This one chart explains most of the post. Prefill sits far to the right, so it is compute-bound. Decode with one user sits at about 1, deep in memory-bound territory. Batching drags decode's weight matmuls to the right, toward the ridge (§4). Attention over the KV cache doesn't move with batch size at all, because every conversation has its own cache to read; that's why long contexts hurt (§6). And the elementwise operations, norms and activations, are always memory-bound. That's why engines **fuse** them into neighboring kernels, so their inputs never make the round trip to HBM [[26]](https://horace.io/brrr_intro.html "Making Deep Learning Go Brrrr From First Principles")[[31]](https://damek.github.io/random/basic-facts-about-gpus/ "Basic facts about GPUs").

The third bucket, overhead, matters most when the GPU work is small: a small model, a small batch, or decode. Launching the hundreds of kernels in one forward pass costs real time, which is why vLLM records each decode step as a CUDA graph and replays it in one launch [[2]](https://vllm.ai/blog/2025-09-05-anatomy-of-vllm "Inside vLLM: Anatomy of a High-Throughput LLM Inference System").

---

## 4. Why decode waits, and how batching helps {#batching}

Put numbers on the decode dot from §3. With one user, each bf16 weight is 2 bytes and is used for 2 operations (a multiply and an add). That's about **1 operation per byte**, against the **295** an H100 needs to keep its tensor cores busy [[4]](https://www.nvidia.com/en-us/data-center/h100/ "H100 Tensor Core GPU specifications"). That ratio is the whole problem in one line.

The fix is to process many conversations in the same pass. Read a weight once, and use it for 32 users instead of one: now you get 32 operations per byte for almost the same time per step. This is **batching**, and it works until the batch is big enough that arithmetic, not memory, sets the pace. Aleksa Gordić's tour of vLLM describes this crossover with a simple roofline [[2]](https://vllm.ai/blog/2025-09-05-anatomy-of-vllm "Inside vLLM: Anatomy of a High-Throughput LLM Inference System"):

<div class="formula">time per decode step ≈ max( weight bytes ÷ bandwidth , 2 × parameters × batch ÷ FLOPS )</div>

Drag the batch size and watch the step time stay flat, then bend upward at the knee:

<div class="roofline-widget"></div>
<script src="{{ A }}/roofline-widget.js"></script>

<div class="worked" markdown="1">
**Worked example.** Llama 3.1 8B in bf16 is 16 GB of weights. At 80% of an H100's bandwidth (about 2.7 TB/s), one decode step takes at least 16 ÷ 2.7 ≈ 6 ms. That caps one user at about 167 tokens a second. Decode 32 users in the same step and it's still about 6 ms, so the server produces about 5,300 tokens a second in total.
</div>

This is the trade-off every serving system tunes. Below the knee, adding users is nearly free. Above it, every extra user slows everyone down. Engines keep the batch full with **continuous batching**. Orca introduced the idea as iteration-level scheduling: the scheduler decides after every step, so finished requests leave and waiting ones join, instead of the whole batch waiting for its slowest member [[7]](https://www.usenix.org/conference/osdi22/presentation/yu "Orca: A Distributed Serving System for Transformer-Based Generative Models")[[2]](https://vllm.ai/blog/2025-09-05-anatomy-of-vllm "Inside vLLM: Anatomy of a High-Throughput LLM Inference System"). Compare the two schedulers, then add a request with a very long prompt and turn on **chunked prefill**:

<div class="batching-widget"></div>
<script src="{{ A }}/batching-widget.js"></script>

The toy numbers make the trade-offs plain. Continuous batching keeps the slots busy and gets first tokens out sooner. A long prompt still freezes everyone who is mid-answer for one long step, and chunked prefill spreads that cost over several shorter steps (§5).

Batching has a side effect most people never notice: it can change your answer. Many GPU kernels pick a different way to add up numbers depending on the batch size, and floating-point addition isn't exactly associative. So the same prompt, at temperature 0, can come out differently depending on how busy the server is. Thinking Machines sent one prompt to a large model 1,000 times and got 80 distinct completions. With kernels rewritten to be **batch-invariant**, all 1,000 matched, at about 1.6× the run time in their lightly optimized version [[13]](https://thinkingmachines.ai/blog/defeating-nondeterminism-in-llm-inference "Defeating Nondeterminism in LLM Inference").

---

## 5. The numbers users feel {#metrics}

Users don't see FLOPS. They see two delays [[1]](https://llama.app/docs/prefill-vs-decode "Prefill vs. Decode")[[2]](https://vllm.ai/blog/2025-09-05-anatomy-of-vllm "Inside vLLM: Anatomy of a High-Throughput LLM Inference System"):

- **Time to first token (TTFT):** from pressing Enter to the first word appearing. This is mostly <span class="k-prefill">prefill</span>, so long prompts hurt it.
- **Time per output token (TPOT):** the average gap between tokens as the answer streams. The gap between any two tokens is called the inter-token latency (ITL). This is <span class="k-decode">decode</span>.

End-to-end latency is about TTFT + output tokens × TPOT. On the server side, **throughput** counts tokens per second across all users, and **goodput** counts only tokens from requests that met their latency targets [[2]](https://vllm.ai/blog/2025-09-05-anatomy-of-vllm "Inside vLLM: Anatomy of a High-Throughput LLM Inference System"). Try the three presets:

<div class="latency-widget"></div>
<script src="{{ A }}/latency-widget.js"></script>

Summarizing a long document is a TTFT problem; writing an essay is a TPOT problem. Notice also the attention share in the summary preset. Prefill cost grows with the *square* of the prompt length, because every token attends to every token before it, so very long prompts get expensive faster than you'd expect.

Production engines protect TTFT with three ideas:

- **Chunked prefill** splits a long prompt across several steps, so it can't freeze everyone else's decoding while it runs; you saw it in the §4 timeline [[2]](https://vllm.ai/blog/2025-09-05-anatomy-of-vllm "Inside vLLM: Anatomy of a High-Throughput LLM Inference System").
- **Prefix caching** reuses the cached keys and values for a prompt prefix the server has seen before, such as a shared system prompt, and skips that part of prefill entirely [[2]](https://vllm.ai/blog/2025-09-05-anatomy-of-vllm "Inside vLLM: Anatomy of a High-Throughput LLM Inference System"). API providers sell the same idea as **prompt caching** [[37]](https://platform.claude.com/docs/en/build-with-claude/prompt-caching "Prompt caching"). §6 shows how it works.
- **Disaggregated prefill and decode** runs the two phases on separate pools of GPUs and ships the KV cache between them, so a burst of long prompts can't stall steady decoding [[16]](https://arxiv.org/abs/2401.09670 "DistServe: Disaggregating Prefill and Decoding for Goodput-optimized Large Language Model Serving")[[2]](https://vllm.ai/blog/2025-09-05-anatomy-of-vllm "Inside vLLM: Anatomy of a High-Throughput LLM Inference System").

Here is what this looks like at the top end. A team serving GLM-5.2, a 744-billion-parameter mixture-of-experts model, in 4-bit on 24 B300 GPUs with disaggregated prefill and decode, brought mean TPOT from about 40 ms to 17 ms. The largest single gain, about 40 ms to 22 ms, came from a fix in how speculative decoding (§7) padded its work on the decode side [[17]](https://vllm.ai/blog/2026-07-23-glm-5.2-nvfp4-b300-pd "From Day 0 to Production SLAs: Serving GLM-5.2 on 24 NVIDIA B300 GPUs with vLLM"). At that scale, the wins are often in the details of the engine.

---

## 6. The KV cache: trading memory for speed {#kv}

Without a cache, every decode step would recompute the keys and values for the whole conversation so far. That's quadratic work, and in the opening figure it shows as a counter that runs away. The cache stores them once, so each step computes only the new token's [[1]](https://llama.app/docs/prefill-vs-decode "Prefill vs. Decode")[[14]](https://huggingface.co/blog/kv-cache "KV Cache from scratch in nanoVLM"). When Hugging Face added a KV cache to their small nanoVLM model, generation got about 38% faster [[14]](https://huggingface.co/blog/kv-cache "KV Cache from scratch in nanoVLM").

The price is memory, and it grows with every token in every conversation:

<div class="formula">KV bytes per token = 2 (K and V) × layers × KV heads × head dim × bytes per value</div>

<div class="worked" markdown="1">
**Worked example.** Llama 3.1 8B has 32 layers and 8 KV heads of dimension 128 [[5]](https://arxiv.org/abs/2407.21783 "The Llama 3 Herd of Models"). In bf16 that's 2 × 32 × 8 × 128 × 2 = **128 KB per token**. One 8,192-token conversation holds about 1.07 GB of cache. Sixteen of them hold 17 GB, more than the model's own weights.
</div>

Why only 8 KV heads when the model has 32 attention heads? That's **grouped-query attention**: several query heads share one key/value head, which cuts the cache by 4× here. Its authors report quality close to full multi-head attention at nearly the speed of a single shared head [[15]](https://arxiv.org/abs/2305.13245 "GQA: Training Generalized Multi-Query Transformer Models from Multi-Head Checkpoints"). It's one reason modern models can afford long contexts at all.

The cache also has to be *read* on every decode step, so long contexts slow decoding down, not just fill memory. Play with the budget:

<div class="kv-widget"></div>
<script src="{{ A }}/kv-widget.js"></script>

### 6.1 Paging: the cache as virtual memory {#paging}

Early servers reserved one contiguous slab of cache per request, sized for the longest answer it might produce, and much of that memory was lost to fragmentation and duplicate copies [[6]](https://arxiv.org/abs/2309.06180 "Efficient Memory Management for Large Language Model Serving with PagedAttention"). vLLM's **PagedAttention** borrowed the idea of pages from operating systems: split the cache into small fixed blocks (16 tokens by default), give each request a **block table** that maps its tokens to blocks, and hand out blocks only as tokens arrive. The PagedAttention paper reports near-zero wasted cache memory and 2–4× higher throughput than earlier systems [[6]](https://arxiv.org/abs/2309.06180 "Efficient Memory Management for Large Language Model Serving with PagedAttention")[[2]](https://vllm.ai/blog/2025-09-05-anatomy-of-vllm "Inside vLLM: Anatomy of a High-Throughput LLM Inference System").

Pages also make sharing easy. vLLM hashes each full block, chained with the hash of the block before it, so two requests that start with the same tokens get the same hashes and can point at the same physical blocks. That's **prefix caching** [[2]](https://vllm.ai/blog/2025-09-05-anatomy-of-vllm "Inside vLLM: Anatomy of a High-Throughput LLM Inference System"). Step through it:

<div class="paged-widget"></div>
<script src="{{ A }}/paged-widget.js"></script>

Turn prefix caching off and replay: the system prompt is stored three times instead of once, and request D pays for the full prefill again.

### 6.2 FlashAttention: never write the big matrix {#flash}

The cache solves decode's recomputation. Prefill has a different attention problem. For a prompt of N tokens, each attention head scores every query against every key: an N × N matrix. A straightforward kernel writes that matrix to HBM, reads it back to apply the softmax, and reads it again to mix the values. At N = 32,768, one head's matrix in one layer is about 2 GB, and it's pure memory traffic.

**FlashAttention** reorganizes the same computation around the memory hierarchy from §3 [[27]](https://arxiv.org/abs/2205.14135 "FlashAttention: Fast and Memory-Efficient Exact Attention with IO-Awareness"). It loads a block of queries into SRAM, streams blocks of keys and values past it, and keeps a running softmax as it goes. Each tile of scores is used and thrown away on chip, so the full matrix never exists in HBM. The result is exact attention, not an approximation, with far fewer HBM reads and writes; the paper reports a 3× training speedup on GPT-2 at 1K tokens [[27]](https://arxiv.org/abs/2205.14135 "FlashAttention: Fast and Memory-Efficient Exact Attention with IO-Awareness").

<div class="flash-widget"></div>
<script src="{{ A }}/flash-widget.js"></script>

You rarely turn this on yourself: vLLM, for example, sets FlashAttention as its attention backend when it starts up [[2]](https://vllm.ai/blog/2025-09-05-anatomy-of-vllm "Inside vLLM: Anatomy of a High-Throughput LLM Inference System"). What it teaches carries further: the fastest kernel is often the one that moves the fewest bytes, not the one that does the fewest operations.

---

## 7. Speculative decoding: guess cheaply, check in bulk {#spec}

Back to the opening figure: each decode pass reads about 15 GB to produce one token, and the arithmetic units are nearly idle. Speculative decoding spends that idle arithmetic on checking guesses [[8]](https://arxiv.org/abs/2211.17192 "Fast Inference from Transformers via Speculative Decoding")[[9]](https://arxiv.org/abs/2302.01318 "Accelerating Large Language Model Decoding with Speculative Sampling").

1. **Draft.** Something cheap proposes the next *k* tokens.
2. **Verify.** The big model runs one forward pass over all *k* guesses at once. Because decode is memory-bound, that costs about the same as producing a single token, and it yields the big model's own prediction at every position.
3. **Accept.** Keep guesses from left to right until the first one the big model disagrees with, and use the big model's token there. If all *k* pass, you get one extra token for free.

The acceptance rule is designed so the output follows exactly the same distribution as the big model on its own; the original paper reports 2–3× faster T5-XXL with identical outputs [[8]](https://arxiv.org/abs/2211.17192 "Fast Inference from Transformers via Speculative Decoding")[[9]](https://arxiv.org/abs/2302.01318 "Accelerating Large Language Model Decoding with Speculative Sampling"). The speedup costs no quality.

The drafter can be a small model of the same family, an **n-gram** lookup that copies text the conversation already contains, a small network that predicts the big model's next internal feature vector instead of the next token (**EAGLE** [[10]](https://arxiv.org/abs/2401.15077 "EAGLE: Speculative Sampling Requires Rethinking Feature Uncertainty")), extra prediction heads on the big model (**Medusa** [[11]](https://arxiv.org/abs/2401.10774 "Medusa: Simple LLM Inference Acceleration Framework with Multiple Decoding Heads")), or multi-token-prediction layers that some models ship with [[17]](https://vllm.ai/blog/2026-07-23-glm-5.2-nvfp4-b300-pd "From Day 0 to Production SLAs: Serving GLM-5.2 on 24 NVIDIA B300 GPUs with vLLM"). Try it:

<div class="spec-widget"></div>
<script src="{{ A }}/spec-widget.js"></script>

If each guess is right with probability α, independently, a round yields on average (1 − α<sup>k+1</sup>) ÷ (1 − α) tokens [[8]](https://arxiv.org/abs/2211.17192 "Fast Inference from Transformers via Speculative Decoding"). Long drafts only pay off when α is high, because one early miss throws away everything after it. Real drafters aren't independent from token to token, so treat the curve as intuition, not a forecast.

Speculation helps most when the server is quiet. With a big batch, the arithmetic is no longer idle, and checking guesses that get rejected starts to cost real throughput. The EAGLE 3.1 team measured exactly this shape: per-user throughput rose 2.03× with one request in flight, 1.71× with four, and 1.66× with sixteen [[12]](https://vllm.ai/blog/2026-05-26-eagle-3-1 "EAGLE 3.1: Advancing Speculative Decoding Through Collaboration Between the EAGLE Team, vLLM, and TorchSpec").

---

## 8. Quantization: fewer bytes per weight {#quant}

If decode speed is roughly bandwidth ÷ bytes, then halving the bytes per weight roughly doubles it, and halves the memory too. Quantization stores weights as low-bit numbers plus a **scale** that maps them back:

<div class="formula">scale = max|w| ÷ (2<sup>bits−1</sup> − 1)  ·  q = round(w ÷ scale)  ·  ŵ = q × scale</div>

The difficulty is outliers. One large weight stretches the scale, and every small weight near it lands on the same few levels, often zero. Try it, then fix it:

<div class="quant-widget"></div>
<script src="{{ A }}/quant-widget.js"></script>

That's why practical schemes give each small **group** of weights its own scale, as the second checkbox does. The best-known methods also decide *which* weights to protect. GPTQ rounds weights one at a time and adjusts the rest to cancel the error [[18]](https://arxiv.org/abs/2210.17323 "GPTQ: Accurate Post-Training Quantization for Generative Pre-trained Transformers"). AWQ observes that protecting about 1% of salient weights, picked by looking at the activations rather than the weights, removes much of the error, and it protects them by scaling their channels instead of keeping them in higher precision [[19]](https://arxiv.org/abs/2306.00978 "AWQ: Activation-aware Weight Quantization for LLM Compression and Acceleration"). Hardware now builds the group idea in: NVIDIA's NVFP4 format stores 4-bit values with an 8-bit scale for every 16 of them, plus one scale per tensor. That's 4.5 bits per weight. NVIDIA reports accuracy within about one point of fp8 on DeepSeek-R1 [[20]](https://developer.nvidia.com/blog/introducing-nvfp4-for-efficient-and-accurate-low-precision-inference/ "Introducing NVFP4 for Efficient and Accurate Low-Precision Inference").

What you quantize decides what you gain:

- **Weights** speed up decode and let big models fit on small hardware, because decode is mostly reading weights.
- **Weights and activations** (for example fp8 throughout) also speed up prefill, on GPUs whose tensor cores do low-precision math natively: an H100's fp8 peak is twice its bf16 peak [[4]](https://www.nvidia.com/en-us/data-center/h100/ "H100 Tensor Core GPU specifications").
- **The KV cache** (for example fp8) fits longer contexts or more users, and cuts the cache reads in long-context decode. Toggle it in the §6 figure. This is **KV cache quantization**, and it attacks the one operation in §3 that batching can't help.

---

## 9. Pruning: fewer weights {#prune}

Pruning removes weights instead of shrinking them. Removing them is the easy part; getting the hardware to actually skip them is harder.

- **Unstructured.** Zero the smallest weights wherever they are. Very large models tolerate this well: SparseGPT pruned OPT-175B and BLOOM-176B to 60% unstructured sparsity with a negligible rise in perplexity, removing over 100 billion weights [[21]](https://arxiv.org/abs/2301.00774 "SparseGPT: Massive Language Models Can Be Accurately Pruned in One-Shot"). But a GPU still multiplies the scattered zeros, so the speedup rarely shows up.
- **2:4 semi-structured.** In every group of four weights, exactly two are zero. Sparse tensor cores, introduced with NVIDIA's Ampere GPUs, exploit this pattern for twice the math throughput of dense units [[22]](https://arxiv.org/abs/2104.08378 "Accelerating Sparse Deep Neural Networks").
- **Structured.** Remove whole neurons, attention heads or layers. You get a smaller dense model that runs fast anywhere, but it costs the most accuracy, so it's usually followed by **distillation**: the original model teaches the smaller one by having it imitate its outputs [[24]](https://arxiv.org/abs/2407.14679 "Compact Language Models via Pruning and Knowledge Distillation").

<div class="prune-widget"></div>
<script src="{{ A }}/prune-widget.js"></script>

Here is the 2:4 pattern in practice: Red Hat pruned Llama 3.1 8B to 2:4 and kept 97–98% of its accuracy on two benchmark suites. Combined with 4-bit weights, it decoded 2.1–3.0× faster for a single user on A5000, A6000 and A100 GPUs [[23]](https://developers.redhat.com/articles/2025/02/28/24-sparse-llama-smaller-models-efficient-gpu-inference "2:4 Sparse Llama: Smaller models for efficient GPU inference"). Compare that with what the bytes alone predict:

<div class="compress-widget"></div>
<script src="{{ A }}/compress-widget.js"></script>

The byte arithmetic says about 4.9× for 2:4 plus 4-bit. The measurement says 2–3×. The gap is everything that doesn't shrink with the weights: activations, attention, the KV cache and kernel overheads. Keep that gap in mind whenever someone quotes a compression ratio as a speedup.

---

## 10. Beyond one GPU: splitting the model {#parallel}

Llama 3.1 70B in bf16 is 141 GB, and 405B is about 810 GB. Neither fits on one 80 GB GPU, so the model has to be split. There are four common ways, and real deployments combine them [[32]](https://developer.nvidia.com/blog/mastering-llm-techniques-inference-optimization/ "Mastering LLM Techniques: Inference Optimization")[[34]](https://docs.vllm.ai/en/latest/serving/parallelism_scaling.html "Parallelism and Scaling"):

- **Tensor parallelism (TP)** splits every layer's weight matrices across GPUs, so each GPU holds a slice of every layer and they all work on the same token at once [[33]](https://arxiv.org/abs/1909.08053 "Megatron-LM: Training Multi-Billion Parameter Language Models Using Model Parallelism"). Each GPU reads only its share of the weights, so their bandwidth adds up and decode gets faster. The price is communication: the GPUs combine partial results inside every layer, so TP wants the fast links within one server (NVLink) [[34]](https://docs.vllm.ai/en/latest/serving/parallelism_scaling.html "Parallelism and Scaling").
- **Pipeline parallelism (PP)** gives each GPU or server a contiguous slice of layers. Only activations pass between stages, so it tolerates slower links, but one token still has to visit every stage in turn.
- **Data parallelism (DP)** runs independent copies of the model and spreads requests across them. It adds throughput, not room.
- **Expert parallelism (EP)** places different experts of a mixture-of-experts model on different GPUs.

vLLM's own rule of thumb: use tensor parallelism inside a server, and add pipeline parallelism across servers when the model doesn't fit in one [[34]](https://docs.vllm.ai/en/latest/serving/parallelism_scaling.html "Parallelism and Scaling"). Try it with the bigger models:

<div class="parallel-widget"></div>
<script src="{{ A }}/parallel-widget.js"></script>

Notice how much the KV cache adds once you serve many long conversations, and how quantization (§8) can cut a whole server out of the plan.

---

## 11. Inference engines: putting it together {#engines}

You rarely build any of this yourself. An inference engine bundles the batching, cache management, kernels and parallelism from this post behind an API. Three open-source engines cover most needs, and each is strongest at a different job:

<div markdown="1" class="tbl-wide" style="overflow-x:auto">

| | vLLM | SGLang | llama.cpp |
|---|---|---|---|
| Best at | High-throughput serving of many users on GPUs | Workloads where requests share context: multi-turn chat, agents, structured output | Running models locally: laptops, desktops, CPUs, Apple silicon |
| Signature idea | PagedAttention: the KV cache in fixed blocks, with continuous batching and prefix caching (§6) [[6]](https://arxiv.org/abs/2309.06180 "Efficient Memory Management for Large Language Model Serving with PagedAttention")[[2]](https://vllm.ai/blog/2025-09-05-anatomy-of-vllm "Inside vLLM: Anatomy of a High-Throughput LLM Inference System") | RadixAttention: keeps cached prefixes in a tree so any request can reuse any shared prefix, plus faster constrained decoding for structured output [[28]](https://arxiv.org/abs/2312.07104 "SGLang: Efficient Execution of Structured Language Model Programs") | Plain C/C++ with no dependencies; integer quantization from 1.5 to 8 bits; runs a model across CPU and GPU when it doesn't fit in VRAM [[29]](https://github.com/ggml-org/llama.cpp "llama.cpp") |
| Also has | Speculative decoding, tensor and pipeline parallelism, disaggregated prefill and decode [[2]](https://vllm.ai/blog/2025-09-05-anatomy-of-vllm "Inside vLLM: Anatomy of a High-Throughput LLM Inference System") | Reported up to 6.4× higher throughput than earlier systems on its benchmark workloads [[28]](https://arxiv.org/abs/2312.07104 "SGLang: Efficient Execution of Structured Language Model Programs") | Backends for CUDA, Metal, Vulkan and more; loads GGUF model files; `llama bench` for measurements [[29]](https://github.com/ggml-org/llama.cpp "llama.cpp")[[1]](https://llama.app/docs/prefill-vs-decode "Prefill vs. Decode") |

</div>

My rule of thumb: start with vLLM for a GPU server, try SGLang when your requests reuse long shared prefixes, and use llama.cpp when the model has to run on hardware you already own. Then measure on your own workload, because the gaps between engines change with every release.

---

## 12. Where this simple model breaks {#limits}

The figures use one idea, bytes versus FLOPS, with assumed efficiencies of 80% of bandwidth and 60% of peak FLOPS. That gets the shape of every curve right, but real systems differ in ways worth knowing:

- **Overheads.** Beyond kernel launches (§3), scheduling, sampling and detokenizing all take time the roofline ignores.
- **Mixture-of-experts models.** Each token uses only some experts. GLM-5.2 has 744B parameters but about 40B are active per token [[17]](https://vllm.ai/blog/2026-07-23-glm-5.2-nvfp4-b300-pd "From Day 0 to Production SLAs: Serving GLM-5.2 on 24 NVIDIA B300 GPUs with vLLM"). At batch 1 you read only the active experts, but a large batch touches many experts, so the bytes per step grow with the batch.
- **Long contexts.** With long conversations and big batches, reading the KV cache can rival reading the weights: for Llama 3.1 8B, sixteen 8K-token conversations hold more cache than the model has weights (§6). Then attention kernels, cache precision and context limits matter more than weight quantization.
- **Many GPUs.** Splitting a model across GPUs adds their bandwidth together, but the communication in §10 eats into it, more so across servers.
- **Quality isn't free.** Aggressive quantization or pruning can cost accuracy, and benchmark averages can hide losses on your task, so measure. Speculative decoding is exact only if the acceptance rule is implemented exactly.
- **Determinism isn't free either.** Batch-invariant kernels make answers reproducible, at a real cost in speed today [[13]](https://thinkingmachines.ai/blog/defeating-nondeterminism-in-llm-inference "Defeating Nondeterminism in LLM Inference").

My view: the simple model is still the right first tool. It tells you which wall you're hitting before you spend a week tuning the wrong thing.

---

## 13. A checklist for a slow deployment {#checklist}

Start from the symptom, not the technique.

1. **Measure first.** Record TTFT and TPOT at the median and the 99th percentile, plus throughput and goodput under realistic load. `llama bench` and `vllm bench` both do this [[1]](https://llama.app/docs/prefill-vs-decode "Prefill vs. Decode")[[2]](https://vllm.ai/blog/2025-09-05-anatomy-of-vllm "Inside vLLM: Anatomy of a High-Throughput LLM Inference System").
2. **Slow first token?** Look at prompt length. Turn on prefix caching if prompts share a beginning, and chunked prefill so long prompts don't block short ones. At large scale, consider disaggregating prefill and decode.
3. **Slow streaming with few users?** You're memory-bound. Quantize the weights, then try speculative decoding; n-gram drafting is nearly free when answers quote the prompt, as in code edits or RAG.
4. **Low throughput when busy?** Grow the batch. That usually means freeing memory for the KV cache: fp8 cache, a smaller maximum context, or quantized weights.
5. **Out of memory, or requests queueing?** Work out the KV budget from §6, then the GPU count from §10, before buying hardware.
6. **Small model, small batch, and the GPU still looks idle?** Suspect overhead (§3). Check that CUDA graphs or an equivalent are on.
7. **Need reproducible outputs?** Use batch-invariant kernels and budget for the slowdown.
8. **After any compression, re-run your own evals.** Benchmarks from a vendor's blog are a starting point, not a guarantee for your task.

---

## 14. Where to read next {#reading}

If you want to go deeper, here is the order I'd take, with the best resource I know for each step:

1. **The model.** Brendan Bycroft's [LLM visualization](https://bbycroft.net/llm) walks through a transformer in 3D [[35]](https://bbycroft.net/llm "LLM Visualization"). Hugging Face's [KV Cache from scratch](https://huggingface.co/blog/kv-cache) shows prefill, decode and the cache in code [[14]](https://huggingface.co/blog/kv-cache "KV Cache from scratch in nanoVLM").
2. **The hardware.** Horace He's [Making Deep Learning Go Brrrr](https://horace.io/brrr_intro.html) is the essay on compute, bandwidth and overhead [[26]](https://horace.io/brrr_intro.html "Making Deep Learning Go Brrrr From First Principles"). Damek Davis's [Basic facts about GPUs](https://damek.github.io/random/basic-facts-about-gpus/) adds arithmetic intensity, fusion and tiling [[31]](https://damek.github.io/random/basic-facts-about-gpus/ "Basic facts about GPUs").
3. **The math of serving.** [All About Transformer Inference](https://jax-ml.github.io/scaling-book/inference/), from Google DeepMind's *How to Scale Your Model*, works through the roofline argument of §3–4 in full [[3]](https://jax-ml.github.io/scaling-book/inference/ "All About Transformer Inference").
4. **The techniques.** NVIDIA's [Mastering LLM Techniques: Inference Optimization](https://developer.nvidia.com/blog/mastering-llm-techniques-inference-optimization/) is a compact survey of everything from batching to parallelism [[32]](https://developer.nvidia.com/blog/mastering-llm-techniques-inference-optimization/ "Mastering LLM Techniques: Inference Optimization"). Then read the original papers: PagedAttention [[6]](https://arxiv.org/abs/2309.06180 "Efficient Memory Management for Large Language Model Serving with PagedAttention"), FlashAttention [[27]](https://arxiv.org/abs/2205.14135 "FlashAttention: Fast and Memory-Efficient Exact Attention with IO-Awareness") and speculative decoding [[8]](https://arxiv.org/abs/2211.17192 "Fast Inference from Transformers via Speculative Decoding").
5. **A real engine.** Aleksa Gordić's [Inside vLLM](https://vllm.ai/blog/2025-09-05-anatomy-of-vllm) follows one request through a production system [[2]](https://vllm.ai/blog/2025-09-05-anatomy-of-vllm "Inside vLLM: Anatomy of a High-Throughput LLM Inference System"). For a sharp lesson in what batching does under the hood, read Horace He's [Defeating Nondeterminism in LLM Inference](https://thinkingmachines.ai/blog/defeating-nondeterminism-in-llm-inference) [[13]](https://thinkingmachines.ai/blog/defeating-nondeterminism-in-llm-inference "Defeating Nondeterminism in LLM Inference").
6. **At scale.** The GLM-5.2 write-up shows disaggregation, 4-bit weights and speculative decoding working together on 24 GPUs [[17]](https://vllm.ai/blog/2026-07-23-glm-5.2-nvfp4-b300-pd "From Day 0 to Production SLAs: Serving GLM-5.2 on 24 NVIDIA B300 GPUs with vLLM").

For reference, keep Modular's [LLM Inference Handbook](https://handbook.modular.com/) open [[25]](https://handbook.modular.com/ "LLM Inference Handbook").

---

## Cite this post

<div class="cite">
<pre id="bibtex">@misc{moniruzzaman2026llminference,
  author       = {Monir Moniruzzaman},
  title        = {Interactive Guide to LLM Inference},
  year         = {2026},
  month        = oct,
  howpublished = {\url{https://monirzaman.github.io/interactive-guide-to-llm-inference/}}
}</pre>
<button type="button" data-copy="#bibtex">Copy BibTeX</button>
</div>

---

## References

<a id="ref-1"></a>[[1]](https://llama.app/docs/prefill-vs-decode) llama.app. [Prefill vs. Decode](https://llama.app/docs/prefill-vs-decode). llama.cpp documentation, accessed October 2026.

<a id="ref-2"></a>[[2]](https://vllm.ai/blog/2025-09-05-anatomy-of-vllm) A. Gordić. [Inside vLLM: Anatomy of a High-Throughput LLM Inference System](https://vllm.ai/blog/2025-09-05-anatomy-of-vllm). vLLM Blog, September 5, 2025.

<a id="ref-3"></a>[[3]](https://jax-ml.github.io/scaling-book/inference/) J. Austin, S. Douglas, R. Frostig, A. Levskaya, C. Chen, S. Vikram, F. Lebron, P. Choy, V. Ramasesh, A. Webson, R. Pope. [All About Transformer Inference](https://jax-ml.github.io/scaling-book/inference/). In *How to Scale Your Model*, Google DeepMind, February 4, 2025.

<a id="ref-4"></a>[[4]](https://www.nvidia.com/en-us/data-center/h100/) NVIDIA. [H100 Tensor Core GPU specifications](https://www.nvidia.com/en-us/data-center/h100/). H100 SXM: 80 GB, 3.35 TB/s, 1,979 BF16 TFLOPS with sparsity (989 dense). Accessed October 2026.

<a id="ref-5"></a>[[5]](https://arxiv.org/abs/2407.21783) Llama Team, AI @ Meta. [The Llama 3 Herd of Models](https://arxiv.org/abs/2407.21783). arXiv 2407.21783, 2024.

<a id="ref-6"></a>[[6]](https://arxiv.org/abs/2309.06180) W. Kwon et al. [Efficient Memory Management for Large Language Model Serving with PagedAttention](https://arxiv.org/abs/2309.06180). SOSP 2023.

<a id="ref-7"></a>[[7]](https://www.usenix.org/conference/osdi22/presentation/yu) G.-I. Yu et al. [Orca: A Distributed Serving System for Transformer-Based Generative Models](https://www.usenix.org/conference/osdi22/presentation/yu). OSDI 2022.

<a id="ref-8"></a>[[8]](https://arxiv.org/abs/2211.17192) Y. Leviathan, M. Kalman, Y. Matias. [Fast Inference from Transformers via Speculative Decoding](https://arxiv.org/abs/2211.17192). ICML 2023.

<a id="ref-9"></a>[[9]](https://arxiv.org/abs/2302.01318) C. Chen et al. [Accelerating Large Language Model Decoding with Speculative Sampling](https://arxiv.org/abs/2302.01318). arXiv 2302.01318, 2023.

<a id="ref-10"></a>[[10]](https://arxiv.org/abs/2401.15077) Y. Li et al. [EAGLE: Speculative Sampling Requires Rethinking Feature Uncertainty](https://arxiv.org/abs/2401.15077). arXiv 2401.15077, 2024.

<a id="ref-11"></a>[[11]](https://arxiv.org/abs/2401.10774) T. Cai et al. [Medusa: Simple LLM Inference Acceleration Framework with Multiple Decoding Heads](https://arxiv.org/abs/2401.10774). arXiv 2401.10774, 2024.

<a id="ref-12"></a>[[12]](https://vllm.ai/blog/2026-05-26-eagle-3-1) EAGLE Team, vLLM Team, TorchSpec Team. [EAGLE 3.1: Advancing Speculative Decoding Through Collaboration Between the EAGLE Team, vLLM, and TorchSpec](https://vllm.ai/blog/2026-05-26-eagle-3-1). vLLM Blog, May 26, 2026.

<a id="ref-13"></a>[[13]](https://thinkingmachines.ai/blog/defeating-nondeterminism-in-llm-inference) H. He and Thinking Machines Lab. [Defeating Nondeterminism in LLM Inference](https://thinkingmachines.ai/blog/defeating-nondeterminism-in-llm-inference). Thinking Machines blog, September 10, 2025.

<a id="ref-14"></a>[[14]](https://huggingface.co/blog/kv-cache) A. R. Gosthipaty et al. [KV Cache from scratch in nanoVLM](https://huggingface.co/blog/kv-cache). Hugging Face blog, June 4, 2025.

<a id="ref-15"></a>[[15]](https://arxiv.org/abs/2305.13245) J. Ainslie et al. [GQA: Training Generalized Multi-Query Transformer Models from Multi-Head Checkpoints](https://arxiv.org/abs/2305.13245). EMNLP 2023.

<a id="ref-16"></a>[[16]](https://arxiv.org/abs/2401.09670) Y. Zhong et al. [DistServe: Disaggregating Prefill and Decoding for Goodput-optimized Large Language Model Serving](https://arxiv.org/abs/2401.09670). OSDI 2024.

<a id="ref-17"></a>[[17]](https://vllm.ai/blog/2026-07-23-glm-5.2-nvfp4-b300-pd) DaoCloud Team. [From Day 0 to Production SLAs: Serving GLM-5.2 on 24 NVIDIA B300 GPUs with vLLM](https://vllm.ai/blog/2026-07-23-glm-5.2-nvfp4-b300-pd). vLLM Blog, July 23, 2026.

<a id="ref-18"></a>[[18]](https://arxiv.org/abs/2210.17323) E. Frantar, S. Ashkboos, T. Hoefler, D. Alistarh. [GPTQ: Accurate Post-Training Quantization for Generative Pre-trained Transformers](https://arxiv.org/abs/2210.17323). ICLR 2023.

<a id="ref-19"></a>[[19]](https://arxiv.org/abs/2306.00978) J. Lin et al. [AWQ: Activation-aware Weight Quantization for LLM Compression and Acceleration](https://arxiv.org/abs/2306.00978). MLSys 2024.

<a id="ref-20"></a>[[20]](https://developer.nvidia.com/blog/introducing-nvfp4-for-efficient-and-accurate-low-precision-inference/) E. Alvarez, O. Almog, E. Chung, S. Layton, D. Stosic, R. Krashinsky, K. Aubrey. [Introducing NVFP4 for Efficient and Accurate Low-Precision Inference](https://developer.nvidia.com/blog/introducing-nvfp4-for-efficient-and-accurate-low-precision-inference/). NVIDIA Technical Blog, June 24, 2025.

<a id="ref-21"></a>[[21]](https://arxiv.org/abs/2301.00774) E. Frantar, D. Alistarh. [SparseGPT: Massive Language Models Can Be Accurately Pruned in One-Shot](https://arxiv.org/abs/2301.00774). ICML 2023.

<a id="ref-22"></a>[[22]](https://arxiv.org/abs/2104.08378) A. Mishra et al. [Accelerating Sparse Deep Neural Networks](https://arxiv.org/abs/2104.08378). arXiv 2104.08378, 2021.

<a id="ref-23"></a>[[23]](https://developers.redhat.com/articles/2025/02/28/24-sparse-llama-smaller-models-efficient-gpu-inference) E. Kurtić, A. Marques, M. Kurtz, D. Alistarh, S. Pandit. [2:4 Sparse Llama: Smaller models for efficient GPU inference](https://developers.redhat.com/articles/2025/02/28/24-sparse-llama-smaller-models-efficient-gpu-inference). Red Hat Developer, February 28, 2025.

<a id="ref-24"></a>[[24]](https://arxiv.org/abs/2407.14679) S. Muralidharan et al. [Compact Language Models via Pruning and Knowledge Distillation](https://arxiv.org/abs/2407.14679). arXiv 2407.14679, 2024. See also NVIDIA's walkthrough, [How to Prune and Distill Llama-3.1 8B to an NVIDIA Llama-3.1-Minitron 4B Model](https://developer.nvidia.com/blog/how-to-prune-and-distill-llama-3-1-8b-to-an-nvidia-llama-3-1-minitron-4b-model/).

<a id="ref-25"></a>[[25]](https://handbook.modular.com/) Modular. [LLM Inference Handbook](https://handbook.modular.com/). Continuously updated, accessed October 2026.

<a id="ref-26"></a>[[26]](https://horace.io/brrr_intro.html) H. He. [Making Deep Learning Go Brrrr From First Principles](https://horace.io/brrr_intro.html). 2022.

<a id="ref-27"></a>[[27]](https://arxiv.org/abs/2205.14135) T. Dao, D. Y. Fu, S. Ermon, A. Rudra, C. Ré. [FlashAttention: Fast and Memory-Efficient Exact Attention with IO-Awareness](https://arxiv.org/abs/2205.14135). NeurIPS 2022.

<a id="ref-28"></a>[[28]](https://arxiv.org/abs/2312.07104) L. Zheng et al. [SGLang: Efficient Execution of Structured Language Model Programs](https://arxiv.org/abs/2312.07104). arXiv 2312.07104, 2023 (v2, 2024).

<a id="ref-29"></a>[[29]](https://github.com/ggml-org/llama.cpp) ggml-org. [llama.cpp](https://github.com/ggml-org/llama.cpp). GitHub repository, accessed October 2026.

<a id="ref-30"></a>[[30]](https://developer.nvidia.com/blog/nvidia-hopper-architecture-in-depth/) NVIDIA. [NVIDIA Hopper Architecture In-Depth](https://developer.nvidia.com/blog/nvidia-hopper-architecture-in-depth/). NVIDIA Technical Blog, March 22, 2022.

<a id="ref-31"></a>[[31]](https://damek.github.io/random/basic-facts-about-gpus/) D. Davis. [Basic facts about GPUs](https://damek.github.io/random/basic-facts-about-gpus/). June 18, 2025.

<a id="ref-32"></a>[[32]](https://developer.nvidia.com/blog/mastering-llm-techniques-inference-optimization/) S. Verma, N. Vaidya. [Mastering LLM Techniques: Inference Optimization](https://developer.nvidia.com/blog/mastering-llm-techniques-inference-optimization/). NVIDIA Technical Blog, November 17, 2023.

<a id="ref-33"></a>[[33]](https://arxiv.org/abs/1909.08053) M. Shoeybi et al. [Megatron-LM: Training Multi-Billion Parameter Language Models Using Model Parallelism](https://arxiv.org/abs/1909.08053). arXiv 1909.08053, 2019.

<a id="ref-34"></a>[[34]](https://docs.vllm.ai/en/latest/serving/parallelism_scaling.html) vLLM. [Parallelism and Scaling](https://docs.vllm.ai/en/latest/serving/parallelism_scaling.html). vLLM documentation, accessed October 2026.

<a id="ref-35"></a>[[35]](https://bbycroft.net/llm) B. Bycroft. [LLM Visualization](https://bbycroft.net/llm). Interactive 3D walkthrough, accessed October 2026.

<a id="ref-36"></a>[[36]](https://arxiv.org/abs/1706.03762) A. Vaswani et al. [Attention Is All You Need](https://arxiv.org/abs/1706.03762). NeurIPS 2017.

<a id="ref-37"></a>[[37]](https://platform.claude.com/docs/en/build-with-claude/prompt-caching) Anthropic. [Prompt caching](https://platform.claude.com/docs/en/build-with-claude/prompt-caching). Claude API documentation, accessed October 2026.

<script src="{{ A }}/post-enhance.js"></script>
