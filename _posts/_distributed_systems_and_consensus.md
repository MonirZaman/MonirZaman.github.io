# Distributed system casestudy: Physalia

- Distributed database
- Offers strong durability and consistency
- A cell consists of 7 nodes
- Compute instance e.g., EC2 is Client that uses Physalia to pinpoint where blocks of a file are stored. Following is an image showing a block storage connected to a compute instance.  
![overview](/images/overview.png)

## Details
- Each Physalia installation is a colony, made up of many cells
- Each cell manages the data of a single partition key
- Cell is implemented using a distributed state machine, distributed across seven nodes
- A cell is a single Paxos-based distributed state machine, with one of the nodes playing the role of distinguished proposer.
- Dividing colony into cells helps to reduce blast radius or minimize the impact of network partition.

## Novel contribution in availability
- Address availability of the database in a unique way by
  utilizing the following information 
  - Network topology 
  - Location of the client
  - Data center power and networking



## CAP theorem
- Primary focus is Strong consistency to ensure correctness of the storage replication protocol
- Secondary focus is availablity. It ensures Physalia is available during network partition.
