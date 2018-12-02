# (In progress)
## Graph convolution neural network (GCN)
GCN is a supervised learning method combining graph theory and Convolution neural networks. We will be using `citeseer` dataset. It is a citation network among academic publications. When a publication cites a another, there is an edge between them. Each publication acts as a node in the network. Node has their attributes which are binary features with values 0/1. Each publication belongs to one of the 7 classes. These classes represent research areas. Using graph convolution neural networks, these classes are inferred.   

## Example
We will first take a look at the citation network. There is a big cluster of nodes that are well connected to each other. On the other hand, there is another set of nodes representing the outer circle in the network with less inter-connectedness (aka low value for clustering coefficients).  
![citeseer_network]({{ site.baseurl }}/images/citeseer_network.png)

Now we will look at the node with most connections to the network. 

GCN library offers code to do classification of each.
