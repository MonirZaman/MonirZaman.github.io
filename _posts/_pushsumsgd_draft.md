# Push Sum SGD

Distributed Stochastic Gradient Descent Algorithm to train neural network faster. They overlap communication with 
computation to avoid communication bottle neck. Their work is faster than ALLREDUCE where each worker communicates with
every other worker. In a setting where communication is a bottleneck, allreduce approach is not feasible. Parameter server
is asynchronous but poses a single source of failure risk. Push sum SGD have been benched marked against existing distributed
training method which show it achieves similar accuracy on validation set but on a significantly less time.  

SGP maintains a communication mixing matrix that determines which compute node communicates with what other nodes. It is a weighted adjacency matrix. In a parallel SGD, each entry is 1/n. In SGP, each node choose its own weights for its neighbors independent of other nodes. When a node sends its gradient to a neighbor, it also sends the weight along with the gradient. The neighbor, upon receiving the gradient and the weight, add the weighted gradient to its own gradient. (line 6-8)  
Idea of mixing weight matrix denotes communication topology among nodes. From Markov Chain literature, it can be shown that after doing some rounds of communication, a gradient from each node eventually reaches every other node despite missing direct communication link. 

Asymetric communication happens where a node sends to another node but not necessarily needs to receive gradient from that node. To overcome challengeds associated with PI = 1/n, authors introduce another scalar w which eventually becomes n and initially set to 1.  

SGP also proposes to perform local gradient update for <tou> iteration where <tou> is bounded. Typically, SGD can converges even when gradients of individual nodes are outdate by one or two iterations.
If a node is passed tou iterations but still has not received gradients from all of its neighbors, then it enters a blocking mode and waits for the remaining gradients from its neighbors.
  
  
