# Push Sum SGD

Distributed Stochastic Gradient Descent Algorithm to train neural network faster. They overlap communication with 
computation to avoid communication bottle neck. Their work is faster than ALLREDUCE where each worker communicates with
every other worker. In a setting where communication is a bottleneck, allreduce approach is not feasible. Parameter server
is asynchronous but poses a single source of failure risk. Push sum SGD have been benched marked against existing distributed
training method which show it achieves similar accuracy on validation set but on a significantly less time.
