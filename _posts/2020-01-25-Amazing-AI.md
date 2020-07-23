<script type="text/javascript" async
  src="https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.5/MathJax.js?config=TeX-MML-AM_CHTML">
</script>

## [Meta-Learning Representations for Continual Learning](https://arxiv.org/pdf/1905.12588.pdf)

``
Javed, Khurram, and Martha White. "Meta-learning representations for continual learning." Advances in Neural Information Processing Systems. 2019.
``

Authors propose to address catastrophic forgetting when learning multiple tasks. Tasks interfere with each other.
When such forgetting appear
1. Correlated inputs  
2. Dense input  
3. Global and greedy update

They propose to create task representation, called RLN. They propose a 
separate prediction model, called PLN. These two steps in combination constitute a learning model that is able to generalize over multiple tasks. RLN is fixed once representation is learned. Only PLN network is updated when continual learning starts.
![network](/images/rln-pln.png)

The authors train these two networks with the objective of reducing interference among tasks. They select a set of correlated samples and a set of random samples. Networks trained on the correlated samples should provide similar performance on the random subset of samples. Loss function measures the performance degrade on the random samples. 
![meta-learning-update](/images/meta-learning-update.png)

The image above shows one update in the meta learning. RLN is initialized with $$\theta_{1}$$ and PLN with $$W_{1}$$. Through gradient descend, PLN is updated k times where k is the number of samples. Then a random subset of samples are drawn and loss is calculated on the random subsets based on the network's prediction. Gradient descend is calculated on the initial parameters $$\theta_{1}$$ and $$W_{1}$$ which are then updated. Similar meta learning steps are repeated many times.

## [Improving Generalization in Meta Reinforcement Learning using Learned Objectives](https://arxiv.org/abs/1910.04098)
In a typical RL problem, a new RL agent is initialized from scratch, placed and trained in a new environment using a human-engineered learning algorithm. The authors propose that the agent should be meta trained first i.e.,  

Meta-Training: It will improve the learning algorithm by using it in one or multiple environments. It should be updated so that it works better when an RL agent uses it to learn (increase reward income).  
Meta-Training should be followed by the regular meta-testing RL step where an agent is initialized and trained in a new environment using a learning algorithm that is learned using **Meta-Training**.

The proposed learning algorithm as an objective function $$L_{\alpha}$$ that is parameterized by a neural network with parameters 
$$\alpha$$. Many other human-engineered RL algorithms are also represented by a specifically designed objective function but in MetaGenRL we meta-learn instead of design it.

![meta-general-learning-scheme](/images/meta-general-learning-scheme.png)

Intuitive workflow:  
[1] All agents interact with their environment according to their current policy. The collected experiences are stored in the replay buffer, essentially a history of everything that has happened.  
[2] Using this replay buffer, one can train a separate neural network, the critic, that can estimate how good it would be to take a specific action in any given situation. 
[3] MetaGenRL now uses the current objective function to change the policy (‘learning’). Then, this changed policy outputs an action for a given situation and the critic can tell how good this action is.  
[4] Based on this information we can change the objective function to lead to better actions in the future when used as a learning algorithm (‘meta-learning’).  
[5] This is done by using a second-order gradient, backpropagating through the critic and policy into the objective function parameters.  
[6] Each policy is updated by differentiating $$L_{\alpha}$$, while the critic is updated using the usual Temporal Difference error. $$L_{\alpha}$$ is meta-learned by computing second-order gradients by differentiating through the critic.  
 
## [META-LEARNING ACQUISITION FUNCTIONS FOR TRANSFER LEARNING IN BAYESIAN OPTIMIZATION](https://arxiv.org/pdf/1904.02642.pdf)  
The authors address how to transfer learning from one meta-learning to the next meta-learning. If the meta-learning search can be biased in the right direction, it has the potential to save time. Authors have studied Bayesian optimization as the meta learning algorithm. Their proposal include:
* There is a notion of source tasks and target task (e.g., Hyperparameter search on a set of 30 datasets to fasttrack search on a given dataset)
* MetaBO is trained on the set of source tasks  

* Train a neural network as Acquisition Function (AF) on the datasets that consists of previous meta-learning outcomes
  * In each iteration of Bayesian Optimization, a task is randomly picked and update Neural AF weights based on learning from the task.
  * It runs some initial non-greedy evaluations to learn about target objective funtion.
* Use Reinforcement learning to facilitate training of the neural network to approximate gradient of the black-box optimization function
* Use the neural network as the acquisition function to identify the next potential point to evaluate
![Meta-BO](/images/metaBO.png)

To review:  
* [Learning search spaces for Bayesian optimization:
Another view of hyperparameter transfer learning](https://papers.nips.cc/paper/9438-learning-search-spaces-for-bayesian-optimization-another-view-of-hyperparameter-transfer-learning.pdf)
  * [Video](https://www.youtube.com/watch?v=4G1dLuW8-kM)
  * [Related work in ICLR 2020](https://arxiv.org/pdf/1904.02642.pdf)

