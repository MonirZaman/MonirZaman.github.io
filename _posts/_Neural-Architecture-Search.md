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
