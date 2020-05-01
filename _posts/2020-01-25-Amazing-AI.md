## [Meta-Learning Representations for Continual Learning](https://arxiv.org/pdf/1905.12588.pdf)

``
Javed, Khurram, and Martha White. "Meta-learning representations for continual learning." Advances in Neural Information Processing Systems. 2019.
``

Authors propose to address catastrophic forgetting when learning multiple tasks. Tasks interfere with each other.
When such forgetting appear
1. Correlated inputs
2. Dense input

They propose to create task representation, called RLN. They propose a 
separate prediction model, called PLN. These two steps in combination constitute a learning model that is able to generalize over multiple tasks. RLN is fixed once representation is learned. Only PLN network is updated when continual learning starts.
[9:44]

The authors train these two networks with the objective of reducing interference among tasks. They select a set of correlated samples and a set of random samples. Networks trained on the correlated samples should provide similar performance on the random subset of samples. Loss function measures the performance degrade on the random samples. Gradient descend is done on the loss value and to update the parameters of the networks. 
