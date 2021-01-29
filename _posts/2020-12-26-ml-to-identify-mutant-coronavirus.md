---
layout: post
title: "Language model to identify next mutant coronavirus 501Y.Vx: Research paper review"
---

A virus continuously evolves to escape its host immune system. A mutant virus needs to have two properties:  
- Fitness
- Semantic change

Fitness will allow the virus to be infectus. Fitness can also be called grammaticality of the virus. Semantic change allow the virus to fool the host's immune system. 

```
Hie B, Zhong ED, Berger B, Bryson B. Learning the language of viral evolution and escape. Science. 2021 Jan 15;371(6526):284-8. 
```

[Hie et. al.](https://www.biorxiv.org/content/biorxiv/early/2020/07/09/2020.07.08.193946.full.pdf) recently applied language model to capture both fitness and semantic change of the virus. Language model is trained by masking out individual position in protein sequence. Language learns to predict them correctly. Language model's output is used as the grammaticality measure. A bidirectional LSTM model is trained for predicting masked out token in the protein sequence. 

Hidden layer's embedding of the BiLSTM model is used to calculated the semantic change. UMAP is used to reduce dimension of the hidden state. Louvain clustering is applied to create clusters and clustering purity is used as the semantic change measure. 

![lstm-mutant](/images/lstm-mutant.png)

A set of new protein sequences is given as input to the model. The sequences are ranked based on their combined score of fitness and semantic change. The combined score is called Constrained semantic change search (CSCS). The higher CSCS score is, the more potential the virus has to escape the host's immune system. 

While there are score for improvements, this early work shows how to use language model to detect successful mutant ahead of time. 
