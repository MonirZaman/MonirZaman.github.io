Autonomous vehicle (AV) heavily utilizes machine learning for various tasks. Majority of these tasks are related to its perception. The perception module helps 
the vehicle sees the world. In this tutorial, I will describe how AV utilizes computer vision to build its perception module. 

## Semantic segmentation
ML model classifies each pixel in an image into a given class in semantic segmentation. Each image comes with a mask that is the ground truth or labels of the image. In AV, there are additional sensors such as LIDAR, thermal camera, etc. Segmentation task can utilize these multi-modal datasets. 

![multimodal-segmentation](/images/multimodal-segmentation.png =100x20)
For example, [Kim et al.](http://www.fsr.ethz.ch/papers/FSR_2017_paper_23.pdf) applies two networks to process individual modality and project 
LIDAR output to the image output to produce the final segmented image.

![enet](/images/enet.png =100x20)
Image network learns 2D feature from images minimizing categorical cross entropy loss. It also designed to minimize inference time. It has the encoder and 
the decoder layers which consist of the initial, downsample, upsample, and bottleneck layers.

For the Lidar network, authors provide the roughness and the porous
feature as input to the network. Since the terrain area should be smoother compared to the high vegetation area. Similarly, space containing vegetation 
should be more porous compared to the terrain area.  Point cloud is represented by the 3D voxel grid. Network learns 3D feature representations minimizing 
categorical cross entropy loss in the 3D data. Network consists of 3D convolution layer, max-pooling layer, and upsampling layer. 

To calculate roughness feature, a plane is fitted in each voxel. Average residual of each point from the fitted plane is the measure of roughness. Terrain tends to be less rough than forest, hilly areas. Authors also calculate porosity of each point. These high level features are projected onto 2D images by projected the 3D point location on the 2D images. 

### Fusion
Lidar features are fused to the image features using this network structure:  
![mm-network](/images/mm-network.png =100x20)  

Projection of the 3D Lidar data onto the 2D images is done by a camera model. The camera model perfoms rotation as well as tranlation of the 3D points. Feature fusion is done at the multiple levels to ensure both low level and high level features are seen by different parts of the network. 
