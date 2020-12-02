Autonomous vehicle (AV) heavily utilizes machine learning for various tasks. Majority of these tasks are related to its perception. The perception module helps 
the vehicle sees the world. Recent advancements in deep learning have improved the perception for autonomous. 

In this tutorial, I will describe how AV utilizes computer vision to build its perception module. Autonomous vehicles are equipped with multiple sensors such as camera, Lidar, Radar etc. Any ML model can utilize these mutli-modal datasets. I will review work that shows what data modalities to combine and when to combine in the model. 

## Semantic segmentation
ML model divides an image into several meaningful parts in semantic segmentation. It classifies each pixel in an image into a given class. Each image comes with a mask that is the ground truth or labels of the image. Here is the model architecture typically used for semantic segmentation.

![unet](/images/unet.png)

In AV, ground truth label for pixels can include road, pedestrian, forest, etc. 

![mm-network](/images/multimodal-segmentation.png)
For example, [Kim et al.](http://www.fsr.ethz.ch/papers/FSR_2017_paper_23.pdf) applies two networks to process individual modality and project 
LIDAR output to the image output to produce the final segmented image.

![enet](/images/enet.png)
Image network learns 2D feature from images minimizing categorical cross entropy loss. It also designed to minimize inference time. It has the encoder and 
the decoder layers which consist of the initial, downsample, upsample, and bottleneck layers.

For the Lidar network, authors provide the roughness and the porous
feature as input to the network. Since the terrain area should be smoother compared to the high vegetation area. Similarly, space containing vegetation 
should be more porous compared to the terrain area.  Point cloud is represented by the 3D voxel grid. Network learns 3D feature representations minimizing 
categorical cross entropy loss in the 3D data. Network consists of 3D convolution layer, max-pooling layer, and upsampling layer. 

To calculate roughness feature, a plane is fitted in each voxel. Average residual of each point from the fitted plane is the measure of roughness. Terrain tends to be less rough than forest, hilly areas. Authors also calculate porosity of each point. These high level features are projected onto 2D images by projected the 3D point location on the 2D images. 

### Fusion
Lidar features are fused to the image features using this network structure:  
![mm-network](/images/mm-network.png)  

Projection of the 3D Lidar data onto the 2D images is done by a camera model. The camera model perfoms rotation as well as tranlation of the 3D points. Feature fusion is done at the multiple levels to ensure both low level and high level features are seen by different parts of the network.  

Features can be fused at various other stages of the network like the following:  
![fusion-timing](/images/fusion-timing.png)

Image courtesy: 
```
Feng, Di, et al. "Deep multi-modal object detection and semantic segmentation for autonomous driving: Datasets, methods, and challenges." IEEE Transactions on Intelligent Transportation Systems (2020).
```

