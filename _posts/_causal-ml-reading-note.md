<Learning notes. source: https://blog.ml.cmu.edu/2020/08/31/7-causality/>

Modern machine learning works utilizing correlation among data items. Sometimes these correlation are superficial and do not capture the true reason why something 
happens. 

In the following, let us go through some real-world examples to show why causality matters in our daily life. Figure 5(a) plots the polio rate against ice cream sales in 1949. We can see that they are highly correlated. So does eating more ice cream increase the rate of polio? In the 1940s, public health experts certainly thought so. They even recommended that people stop eating ice cream as part of an “anti-polio diet”. Let us look at another example. Figure 5(b) gives the plots of ice cream sales and shark attacks. Again, they are highly correlated. So does eating ice cream lead to the increase of shark attacks? It seems very weird from our common sense. Then why are there high correlations in these two cases? From the plots, we can see that in both cases, there is a peak around August. From a causal view, in the first case, it is the temperature that affects both ice cream sales and polio rates. With the increase of temperature, both ice cream sales and polio rates increase, thus leading to a high correlation between ice cream sales and polio. Similarly, in the second case, temperature is also the confounder of ice cream sales and shark attacks. It is the ignorance of a confounder that causes the spurious correlation. If we directly analyze data at hand without investigation and thinking, it is possible to make misleading conclusions. 

# How to measure causality
* Random experiment
* Constrained functional causal models:  
  - It uses an independent noise term. Suppose, cause is X, effect is Y and noise is E. X and E are assumed to be independent.
  - Due to the independence between the noise and cause, causal direction hold only for the true causal direction and are violated for the wrong direction. 
  - Examples of such constrained functional causal models include the Linear, Non-Gaussian, Acyclic Model (LiNGAM (Shimizu et al., 2006)), the additive noise model (Hoyer et al., 2009; Zhang and Hyvärinen, 2009a), and the post-nonlinear causal model (Zhang and Chan, 2006; Zhang and Hyvärinen, 2009b).
  - Consider a real-world example ([Hoyer et al., 2009]). Suppose we have observational data from the ring of an abalone, with the ring indicating its age, and the length of its shell. We want to know whether the ring affects the length, or the inverse. We can first regress length on ring, that is,
      length = f(ring) + E

- and test the independence between estimated noise term E and ring, and the p-value is 0.19. Then we regress ring on length:
      ring = g(length) + E'

- and test the independence between E’ and length, and the p-value is smaller than 10e-15, which indicates that E’ and length are dependent. Thus, we conclude the causal direction is from ring to length, which matches our background knowledge. 
