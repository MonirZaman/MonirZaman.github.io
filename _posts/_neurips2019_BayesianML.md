# [Exact GP for a million data points](https://arxiv.org/pdf/1903.08114.pdf)


* Propose to use exact GP instead of approaximation
* Distribute computation by reducing training to an element-wise product between matrix and vector
* Speed up inference by caching covariance calculation of training points
