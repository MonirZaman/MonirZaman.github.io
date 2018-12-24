# (In progress)
## Graph convolution neural network (GCN)
GCN is a semi-supervised learning method combining graph theory and Convolution neural networks. We will be using `citeseer` dataset. It is a citation network among academic publications. When a publication cites a another, there is an edge between them. Each publication acts as a node in the network. Node has their attributes which are binary features with values 0/1. Each publication belongs to one of the 7 classes. These classes represent research areas. Using graph convolution neural networks, these classes are inferred.   

## Network architecture
There are two hidden layers that perform two rounds of information propagation. In the first round, a node receives information about its neighbors. In the second round, neighbors' information of a node is propagated to its neighbors. After the first pass, we can say, a node has up-to-date information about its neighbors. When we want to classify a node, a second round of information passing provides the most up-to-date information about the node's neighbors. 

## Example
We will first take a look at the citation network. There is a big cluster of nodes that are well connected to each other. On the other hand, there is another set of nodes representing the outer circle in the network with less inter-connectedness (aka low value for clustering coefficients).  
![citeseer_network](/images/citeseer_network.png)

Now we will look at the node with most connections to the network. 

## Classification performance:
A confusion matrix is N by N table comparing model's prediction against true values. It shows how often labels are correctly classified as well as misclassified. GCN confusion matrix is the following. 

GCN is able to correctly classify most of the labels except for label <> which represents <>. Looking back on the histogram of the train records with this label is the least among all the categories. Accuracy of the GCN is <>%. 

This concludes demonstration of GCN on a graph-based dataset. If you have any questions or comments, feel free to reach out to me  through linked-in.  
