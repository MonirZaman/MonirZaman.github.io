Random forest is one of the widely used machine learning models for supervised inference task. It is robust to missing values in dataset as well as outliers. It is an ensemble of many decision trees. Therefore, it achieves good accuracy in practice. In this post, I will present detail mathematics of how a Random forest works.

Supervised learning can be divided into Classification and Regression. 
* Classification is supervised learning where target variable is categorical
* Regression is supervised learning where target variable is numeric

## Dataset
A model is trained to learn relation mapping between a set of input features and target feature on a given dataset. Hyperparameters define various characteristics of the model ranging from complexity, learning rate of the model. These are set by taking best performance measured on the validation dataset. Model's final performance is reported on the test dataset.  

## Classification
A toy classification task will be used to present the material. Given color and diameters of different fruits, classification task is to determine exact fruit label: grape, lemon, apple. 

I will explain how a decision tree can be used to perform classification. Decision is also the building block of Random forest. Decision tree progressively asks questions with binary (Yes/No) answers. Records for which answer is No are separated into a (left) group and records with answers Yes are separated into another (right) group. Process of grouping records continues untill one of the following:
* One record left in a group
* Group does not have any mixed labels. For example, all fruits are grapes
* There is no question left that can separate records into two groups by unmixing label.

