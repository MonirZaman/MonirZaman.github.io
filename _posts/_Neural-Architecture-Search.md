# (DRAFT)  
Neural architecture search (NAS) finds best architecture of the neural network to solve a given problem. It first finds the architecture and then the weights of the network are trained via gradient descend.  

Steps  
* Start with networks with no hidden nodes
and only a fraction of the possible connections between input and output. 
* New networks are created by: insert node, add connection, or change
activation. To insert a node, an existing connection is splitted into two connections that
pass through this new hidden node. 

* Best network is chosen by sampling from the performance disctribution. 

* Chosen network is then modified and search continues.

* Loss function takes performance and network size into account. Given two networks providing similar performance, a simpler network is chosen. 


## Research work: Weight agnostic neural networks
```
Weight Agnostic Neural Networks  
Adam Gaier, David Ha
NeurIPS 2019
```

* Perform NAS with random weights 
* Replace training weights with shared random weights and multiple trials
* It is easy to tune a single shared weight than it is to perform gradient descend over the network
* Log mean performance of an architecture over 100 trials with different random weights
* Network architecture provides an inductive bias towards a particular task or a set of tasks and their solutions
  * It encode relationships and rely on dependency between systems set among each other e.g., an equation combining different aspects of the system
  
 ![Winning architecture of car racing agent](/images/winning-architecture-car.png)
 *Winning architecture of car racing agent (https://arxiv.org/abs/1906.04358)*

