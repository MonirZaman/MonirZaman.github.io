
## Keynote: 

* [You Can’t Escape Hyperparameters and Latent Variables: Machine Learning as a Software Engineering Enterprise](https://neurips.cc/virtual/2020/protected/invited_16166.html)
    - We are compiler hackers
    - How can we make AI to make our life better
    - Pay attention to what AI you are designing to the world
    - Be aware of the bias in the data and how it was collected
    - Pay attention to how your model will be used
    - Tradeoffs make some things better and somethings worse 
    **Code bless us All**

* [Feedback control loop](https://neurips.cc/virtual/2020/protected/invited_16168.html)   
    - Multi-agent learning games
    - Non-stationary environment
    - (1) Stabilize and shape behavior
        - Two player and multi-player/agent learning
        - Zero-sum game
        - Allocation game
        - Learning rule example: replicator dynamics
        - Can natural learning rule lead to nash equilibrium?
            - Update rule depends on a user's own strategy
            - Uncoupled learning rule
            - Anti-coordination game

        - Introduce auxiliary states for higher order learning
        - Anticipatory learning - where things are heading taking into account
        - Optimization - optimistic gradient ascent
    
    - (2) Robustness to variation
        - Internal: thrust, drag
        - External: weather
        - Nominal analysis
        - Contractive game: allow auxiliary dynamics over long term
        - Partially observed markov process
        
    - (3) Track command signals
        - Forecasting and no-regret
        - Distributional forecast
        
   
## Representation learning

* [Learning Physical Graph Representations from Visual Scenes](https://neurips.cc/virtual/2020/protected/poster_4324e8d0d37b110ee1a4f1633ac52df5.html)
* [Multi-label Contrastive Predictive Coding](https://neurips.cc/virtual/2020/protected/poster_5cd5058bca53951ffa7801bcdf421651.html)
* [Learning optimal representation](https://neurips.cc/virtual/2020/public/poster_d8ea5f53c1b1eb087ac2e356253395d8.html)
    - Consider a subset of classifier that are accessible
    - Minimality causes generalization
* [Manifold in Graph embedding]
    - Representation of each point in the embedding space
    - Singular value decomposition
* [Hebbian Memory Network]
    - Biology inspired
    - Single layer memory module
    - Based on associative memory implemented by plasticity
    - Memory module is differentiable
    
## Vision application

* [Neural Sparse Voxel Fields - NSVF](https://neurips.cc/virtual/2020/protected/poster_b4b758962f17808746e9bb832a6fa4b8.html)
    - Voxel embedding
    - Ray voxel intersection and matching
    - Progressive initialization with self pruning
* [3D Multi-bodies: Fitting Sets of Plausible 3D Human Models to Ambiguous Image Data](https://neurips.cc/virtual/2020/protected/poster_ebf99bb5df6533b6dd9180a59034698d.html)
    - Set of plausible meshes
    - 3D reconstruction from 2D have to address ambiguity
    - n-Quantization for multiple hypothesis, normalizing flows, reprojection loss for mode degeneration for sparse gradients
    - Normalizing flows convert complex distribution such as 3D meshes to simpler distribution such as multivariate gaussian
    
## Sparsity

- Gaussian weights
- Constant expansion between layers
- Uniform concentration

## Day 2

* [Deep Implicit Layers: Neural ODEs, Equilibrium Models and Beyond](https://neurips.cc/virtual/2020/protected/tutorial_ad1df793247a0e650d0d7166341b8d97.html)

* [Generative conversational AI](https://neurips.cc/virtual/2020/protected/tutorial_3e267ff3c8b6621e5ad4d0f26142892b.html)
    - Perplexity, BLEU
    - Human evaluation Likert (Humanness, coherence, fluency)
    - Human A/B test like interaction
    - Vanilla Seq-to-Seq model: Lack of diversity, inconsistency, lack of knowledge, lack of empathy
    - Ways to address:
    - Deeper conversation 
    - Add diversity: Nucleus sampling
    - Personalization: embedding
    - Knowledge graph
    ![knowledge-graph](/images/knowledge-graph.png)
    - Text knowledge
    ![text-knowledge](/images/text-knowledge.png)

* [Forget About the LiDAR: Self-Supervised Depth Estimators with MED Probability Volumes](https://slideslive.com/38942458/forget-about-the-lidar-selfsupervised-depth-estimators-with-med-probability-volumes)
    - State of the art SIDE can be achieved by autoencoder network incorporating MED representations in the output layer
    - Outperforms DORN supervised baseline
    
    
## Day 1

* [Differential privacy with pytorch](https://slideslive.com/38942327/opacus-differential-privacy-on-pytorch)
<div id="presentation-embed-38942327"></div>
<script src='https://slideslive.com/embed_presentation.js'></script>
<script>
    embed = new SlidesLiveEmbed('presentation-embed-38942327', {
        presentationId: '38942327',
        autoPlay: false, // change to true to autoplay the embedded presentation
        verticalEnabled: true
    });
</script>

* [Make boats fly](https://neurips.cc/ExpoConferences/2020/talk%20panel/21297)
- Optimize folds to laptime
- Use simulator to optimize design choices
- Objective is to evaluate as many design choices as possible
- Boats have more inputs than f1 cars
- Use RL to optimize the design choices
- Boat simulator: loosely defined goal, imperfect knowledge of the environment and complex dynamics
- RL controls 14 inputs. Optimizes the velocity made good.
    - Autopilot/RL trained agent follow the path and perform manuevers
    - Curriculumn learning, custom initialization, sharing experience replay buffer across workers, domain randomization, sample efficient, recovering spot instances, use different seeds
    - Encapsulate a simulator in gym environment
    - Rewards
    - Autopilot/RL evaluates a design
    - Genetic search like method to search optimal design choices
    - Removes uncertainty of human input. No need to perfom many lapse and average output

* [The Challenges and Latest Advances in Causal AI](https://slideslive.com/38942298/the-challenges-and-latest-advances-in-causal-ai)
    - causal model helps to adapt data drift in dynamic world
    -  It helps to discover causal driver and avoid spurious correlation
    - Works with small data
    - causalLens is an ML library that helps users to build causal model
    - Reading list:
        - Beyond structural causal models: causal constraints models by Blom et al. 2019
        - Necessary and sufficient conditions for causal feature selection in time series by Mastakouri et al. 2020
        - DYNOTEARS structural learning from time series data by Pamfil et al 2020

* [MINING AND LEARNING WITH GRAPHS AT SCALE](https://neurips.cc/ExpoConferences/2020/workshop/20237)
- Tell us about our data:  Local data to Global data
- Computation on Multi-modal data
- Scaling: mapreduce, distributed hashtable, GraphTensor for tensorflow, jraph 
- Widely used features: graph building and clustering, semi-supervised learning, GNNs and embedding
- Graph building: LSH, semisupervised, local search and auto-encoders.
- Clustering
- Information propagation
- Signals and topological analysis

GNN and COVID-19
- Spatial and temporal information was used to model COVID-19 spread
- Graph used spatial information to build the graph. One graph is built for each day. A graph receives information from the previous day's graph.
- Model predicts case count

Graphs for privacy
- Federated learning of cohorts
- Cluster of k users. Users within a cluster bear similarity in browser behavior
- Affinity hierarchical clustering algorithm

Causal inference
- Random trial
- Clustering: group nodes that are in control group and treatment group
- Correlation clusterings beat balanced clustering

[Grale: Building graph at scale](https://arxiv.org/pdf/2007.12002.pdf)
- Semi-supervised learning and inference on the unlabeled nodes
- Different types of relationship. Finding the right relationship is important
- Multi-modal features
- Bucket using LSH. Within each bucket, training data (whether two node belong to the same graph) and build graph
- Grale at Youtube to find malicious actor
    - Abusive vs non-abuse item

Clustering at scale
- Affinity Hierarchical clustering
- MapReduce 
- Randomized Composable Core-sets

