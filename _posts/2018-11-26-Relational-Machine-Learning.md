![Data in non-Euclidean space](/images/manifold.png)

In real work data often live in non-euclidean space. Examples include social networks, point clouds, etc. Such data contains topological information and are non-linear in nature. Typical machine learning models treat data point as independent to each other. In this post we will look at a model that exploits the inter-relationship of the data points and apply them to perform machine learning task such classification. First we look at some non-euclidean data 

1. Manifold:  
2D shapes that exists in a 3D space in a twisted form. Example includes point clouds. In [another example](https://jakevdp.github.io/PythonDataScienceHandbook/05.10-manifold-learning.html), consider a sheet of paper which is a 2D object which can be rolled and be embedded into a 3D space. Although the paper is still a 2D object, its embedding into high dimensional space is not linear.

2. Graph:  
Social networks among people


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
![citeseer_network](/images/confusion_matrix.png)

GCN is able to correctly classify most of the labels with an accuracy of 71% on the test test. Macro F1 score is 0.68 which shows a balance between precision and recall. Model performs best in identifying class 5 while misclassifying only 18% of the samples belong to this class. Misclassification rate in all the classes are [0.55, 0.39, 0.28, 0.29, 0.2, 0.18].  
This concludes demonstration of GCN on a graph-based dataset. If you have any questions or comments, feel free to reach out to me  through [Linked-in](https://www.linkedin.com/in/monir1/).  
