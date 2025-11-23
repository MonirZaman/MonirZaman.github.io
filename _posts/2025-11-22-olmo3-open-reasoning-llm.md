The Allen Institute for AI (AI2) has released Olmo 3, an open reasoning LLM. This post outlines an overview.

![infographic](/images/llm/olmo3-info.png)
[podcast](https://notebooklm.google.com/notebook/4d8c587a-b738-4fc5-8db6-deb732807e2a?artifactId=600f230b-3a05-4a23-aa19-3757a22631ab)

The Allen Institute for AI (AI2) has released [**Olmo 3**](https://www.datocms-assets.com/64837/1763662397-1763646865-olmo_3_technical_report-1.pdf), a new family of **state-of-the-art, fully open language models**. Available at **7B** and **32B** parameter scales, Olmo 3 models are engineered for **long-context reasoning, function calling, coding, instruction following, general chat, and factual recall**.

What sets Olmo 3 apart is not just raw capability—it’s the unprecedented commitment to **complete transparency** across the entire development pipeline.

---

## Radical Transparency: The Entire Model Flow, Open to All

Olmo 3 is built on a philosophy of **full lifecycle openness**. AI2 has released:

- **Every checkpoint**
- **Every datapoint and dataset mix**
- **Every dependency and training stage**

This means researchers and builders can intervene at **any** point in the process—pretraining, midtraining, post-training, RL, or evaluation. Instead of offering only final model weights, Olmo 3 provides a *fully open model flow*.

The result is one of the **most customizable and auditable open model families ever released**.

---

## The Olmo 3 Model Family

Olmo 3 includes several specialized variants tailored for different use cases:

### 1. **Olmo 3 Base**
Models: `Olmo-3-1025-7B`, `Olmo-3-1125-32B`

The Base models provide a strong general-purpose foundation. The 32B variant **substantially outperforms other fully open models** in math and code and rivals the most capable open-weight models overall.

### 2. **Olmo 3 Think**
Models: `Olmo-3-7B-Think`, `Olmo-3-32B-Think`

The flagship reasoning models. Think variants are trained to generate **extended thinking traces** before responding, boosting complex reasoning.  
The 32B model is currently the **strongest fully open reasoning model** and matches top open-weight competitors (e.g., Qwen 3 32B) despite being trained on **~6× fewer tokens**.

### 3. **Olmo 3 Instruct**
Model: `Olmo-3-7B-Instruct`

The Instruct line is optimized for **concise, helpful, user-facing responses**—and intentionally avoids exposing internal chain-of-thought.  
It **outperforms models like Qwen 2.5, Gemma 3, and Llama 3** at comparable scales.

### 4. **Olmo 3 RL-Zero**
Models:  
- `Olmo-3-7B-RLZero-Math`  
- `Olmo-3-7B-RLZero-Code`

This pathway enables researchers to run **Reinforcement Learning with Verifiable Rewards (RLVR)** starting from a clean base model. It provides a uniquely open benchmark for studying how pretraining data influences RL-driven performance.

---

## How Olmo 3 Is Built: The Model Flow

Olmo 3 development spans two major phases: **pretraining** and **post-training**.

---

## Phase 1: Base Model Training

The base models are trained in three sequential stages:

| Stage | Data Mix | Purpose |
|-------|----------|---------|
| **1. Pretraining** | **Dolma 3 Mix** | Establishes the core model, trained up to 5.9T tokens. Includes global deduplication and large-scale PDF ingestion via **olmOCR**. |
| **2. Midtraining** | **Dolma 3 Dolmino Mix** | Adds 100B curated tokens targeting code, math, and QA. Begins establishing patterns for instruction following and thinking traces. |
| **3. Long-Context Extension** | **Dolma 3 Longmino Mix** | Extends the model to support **64K context** using long documents, including scientific PDFs processed with olmOCR. |

Architecturally, the model uses:

- An **8192-token window** during initial stages  
- **Sliding Window Attention (SWA)** in 3 of every 4 layers  
- Efficient long-sequence scaling during extension  

These design choices allow Olmo 3 to train deeply and efficiently at long context lengths.

---

## Phase 2: Post-Training Pipeline

Post-training unlocks the specialized Think, Instruct, and RL-Zero variants. This phase is powered by **Dolci**, a new high-quality data suite designed for:

- Instruction following  
- Reasoning and chain-of-thought  
- Function calling  
- Reinforcement learning  

The core pipeline includes:

### 1. **Supervised Fine-Tuning (SFT)**
Uses datasets such as **Dolci Think SFT** and **Dolci Instruct SFT** to establish the baseline behaviors required by each model family.

### 2. **Preference Optimization (DPO)**
Applies **Direct Preference Optimization** using curated preference datasets (e.g., **Dolci Think DPO**).  
DPO strengthens reasoning and alignment through **Delta Learning**—a contrastive method that refines outputs without overfitting.

### 3. **Reinforcement Learning with Verifiable Rewards (RLVR)**
Uses the new **OlmoRL** framework to scale RL across multiple domains beyond math and code.

Key improvements include:

- **Up to 4× faster RL training**
- Generalizable verifiable objective functions
- Stable training from both SFT and DPO starting points  
  (though **DPO → RLVR** proved strongest for Think models)

For Instruct models, additional datasets refine **function calling** and enforce **concise, direct** responses.

---

## Why Olmo 3 Matters

Olmo 3 represents a milestone in **open research ecosystems**:

- Full transparency from raw data to final model  
- Industry-competitive performance at 7B and 32B scales  
- Dedicated models for reasoning, instruction following, and RL research  
- A reproducible, extensible pipeline for the community  

By releasing *everything*, AI2 has created not just a model—but an open platform for inventing the next generation of AI systems.

---
