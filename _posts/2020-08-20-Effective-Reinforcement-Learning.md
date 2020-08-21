Reinforcement learning is prone to noise. It is harder to reproduce an experiment that trains a reinforcement learning agent. An agent can produce different results despite using the same seed for random number generator. Primary reasons are the following  

- Stochastic environment is stochastic. The same set of actions may lead to different states of the world and rewards
- Agents with different initialization of weights produce different results
- Different choice of hyperparameters produce different results
- Distributed training of the agent
- Non-determinism from the ML framework

Noise in the agent's output impacts any meta-learning. I will demonstrate one example of noise when several parameters are tuned for `cartpole` reinforcement learning agent.
![cart](https://camo.githubusercontent.com/7089af78ce27348d2a71698b6913f7656a6713cc/68747470733a2f2f63646e2d696d616765732d312e6d656469756d2e636f6d2f6d61782f3830302f312a6f4d5367325f6d4b677541474b793143363455466c772e676966 "cart")  

Noise in the agent is displayed in the picture where the agent produces different results for the same set of action and hyperparameters. 
![rl-reward](/images/rl-rewards.png)

For a code example, access the jupyter notebook [here](https://monirzaman.github.io/blog/2020/08/19/noisy-evaluation.html). 
