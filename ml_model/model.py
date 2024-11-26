import pandas as pd


# Read abstract, category, year of each paper 
papers = pd.read_csv(f'./dataset/papers.csv.gz', compression='gzip') 
# Read the embedding vector of each paper 
feats = pd.read_csv(f'./dataset/feats.csv.gz', compression='gzip', 
header=None).values.astype(np.float32) 
# Read the citation relations between papers 
edges = pd.read_csv(f'./dataset/edges.csv.gz', compression='gzip', 
header=None).values.T.astype(np.int32) 
citer, citee = edges 