---
layout: post
title: "Fact checking NLP: Selecting the right evidence using BERT"
---

In order to verify a claim, we can utilize a knowledge corpus like Wikipedia. Checking a claim generally involves three steps 1) relevant document retrieval from knowledge corpus, 2) relevant sentence retrieval from the document that are related to the claim, 3) identify whether the claim is supported by the evidence sentences.

In step 1, one process the claim to extract relevant entities which are then used to select Wikipedia documents. Tools for extracting entities include ``AllenNLP, Stanford OpenIE``. [MediaWiki API](https://www.mediawiki.org/wiki/API:%20Main_page) can be used for probing Wikipedia. 

In step 2, one needs select the relevant sentences from the Wikipedia pages as not all the information are needed to verify the claim. An ML model can be trained to select a set of related sentences for a given claim. 

In step 3, once a claim is assigned a set of related sentences/evidences, one can train another ML model to classify the label for the claim: supported, refuted or not enough information.

This post will focus on ``step 2`` which identifies the relevant sentences needed to verify a claim. I will describe the work done by [Zhenghao Liu et al.](https://www.aclweb.org/anthology/2020.acl-main.655.pdf) It uses the [FEVER dataset](https://arxiv.org/abs/1803.05355) that provides Wikipedia documents for a given claim. FEVER dataset contains 185,455 annotated claims with 5,416,537 Wikipedia documents. It is a fact-verification dataset with each claim annotated as SUPPORTS, REFUTES or NOT ENOUGH INFO by annotators. Here is the dataset format:  
```
{'claim': 'Régine Chassagne is Canadian.',
 'evidence': [['Régine_Chassagne',
   0,
   'Régine Chassagne LRB LSB ʁeˈʒin ʃaˈsaːɲ RSB ; born 19 August 1976 RRB is a Canadian multi instrumentalist musician , singer and songwriter , and is a founding member of the band Arcade Fire .',
   0],
  ['Régine_Chassagne', 1, 'She is married to co founder Win Butler .', 0],
  ['Régine_Chassagne',
   0,
   'Régine Chassagne LRB LSB ʁeˈʒin ʃaˈsaːɲ RSB ; born 19 August 1976 RRB is a Canadian multi instrumentalist musician , singer and songwriter , and is a founding member of the band Arcade Fire .',
   1],
  ['Régine_Chassagne', 1, 'She is married to co founder Win Butler .', 0]],
 'id': 180425,
 'label': 'SUPPORTS'}
```
`evidence` is a list of sentences from the wikipedia documents with the format: ``wiki_document_name, sentence/evidence_id, evidence_content, support_flag``.

Snapshot of the wikipedia article for the above claim is:  
![wiki_regina](/images/wiki_regina.PNG)

Since a claim can have many sentences / evidences. A classifier can be trained to select a subset of the evidences that are most relevant. In order to do that, a pair-wise dataset is prepared where each claim is followed by relevant evidence. Conversely, the record also adds its non-relavant evidence with the appropriate flag. Here is an example:  
```
Ireland is a place on Earth surrounded by water.	Ireland	It is separated from Great Britain to its east by the North Channel , the Irish Sea , and St George 's Channel .	Ireland	As of 2013 , the amount of land that is wooded in Ireland is about 11 % of the total , compared with a European average of 35 % .
```
Here the first sentence is the claim and the second sentence and onwards are evidence that are separated by tab. Each supporting evidence of a claim are paired with all the other non-supportive evidence to create records. 

BERT model provides the representation for the claim-evidence pair. A learning-to-rank layer maps the representation to a ranking score. It is trained to output high score for supporting evidence and low score for non-supporting evidence. [Margin Ranking Loss](https://pytorch.org/docs/stable/generated/torch.nn.MarginRankingLoss.html) is used as the loss function. Inference is done by feeding a claim and its evidences without any annotation. If the golden evidences for a given claim appear within the top 5 scores, then it is considered as a successful retrieval. Performance is measured in F1@5, Precision@5 and Recall@5 scores.  

Run it on a [colab notebook](https://colab.research.google.com/drive/1LN_qvn20_XF4BGt-mfV5Z4LWpUDNMiBd?usp=sharing). 
