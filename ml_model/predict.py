import pandas as pd
import numpy as np
import csv

# 读取数据集
papers = pd.read_csv('./ml_model/dataset/papers.csv.gz', compression='gzip')
feats = pd.read_csv('./ml_model/dataset/feats.csv.gz', compression='gzip', header=None).values.astype(np.float32)
edges = pd.read_csv('./ml_model/dataset/edges.csv.gz', compression='gzip', header=None).values.T.astype(np.int32)

# 数据集划分
train_papers = papers[papers['year'] <= 2017]
val_papers = papers[papers['year'] == 2018]
test_papers = papers[papers['year'] >= 2019]

train_feats = feats[train_papers.index]
val_feats = feats[val_papers.index]
test_feats = feats[test_papers.index]

train_labels = train_papers['category'].values
val_labels = val_papers['category'].values
test_labels = None  


def standardize_features(X, mean=None, std=None):
    if mean is None or std is None:
        mean, std = np.mean(X, axis=0), np.std(X, axis=0)
    return (X - mean) / (std + 1e-8), mean, std

train_feats, mean, std = standardize_features(train_feats)
val_feats, _, _ = standardize_features(val_feats, mean, std)
test_feats, _, _ = standardize_features(test_feats, mean, std)

# 标签编码
def label_encode(labels):
    unique_labels = np.unique(labels)
    label_map = {label: idx for idx, label in enumerate(unique_labels)}
    encoded_labels = np.array([label_map[label] for label in labels])
    return encoded_labels, label_map

train_labels, label_map = label_encode(train_labels)
val_labels = label_encode(val_labels)[0]

# 激活函数
def relu(x):
    return np.maximum(0, x)

def relu_derivative(x):
    return (x > 0).astype(np.float32)

def softmax(x):
    exp_x = np.exp(x - np.max(x, axis=1, keepdims=True))
    return exp_x / np.sum(exp_x, axis=1, keepdims=True)

def cross_entropy_loss(y_pred, y_true):
    m = y_true.shape[0]
    log_likelihood = -np.log(y_pred[range(m), y_true])
    return np.sum(log_likelihood) / m

class MLP:
    def __init__(self, input_size, hidden_sizes, output_size, learning_rate=0.01):
        self.learning_rate = learning_rate
        
        # 初始化权重和偏置
        self.W1 = np.random.randn(input_size, hidden_sizes[0]) * np.sqrt(2 / input_size)
        self.b1 = np.zeros((1, hidden_sizes[0]))
        
        self.W2 = np.random.randn(hidden_sizes[0], hidden_sizes[1]) * np.sqrt(2 / hidden_sizes[0])
        self.b2 = np.zeros((1, hidden_sizes[1]))
        
        self.W3 = np.random.randn(hidden_sizes[1], output_size) * np.sqrt(2 / hidden_sizes[1])
        self.b3 = np.zeros((1, output_size))

    def forward(self, X):
        self.z1 = X @ self.W1 + self.b1
        self.a1 = relu(self.z1)
        self.z2 = self.a1 @ self.W2 + self.b2
        self.a2 = relu(self.z2)
        self.z3 = self.a2 @ self.W3 + self.b3
        self.a3 = softmax(self.z3)
        return self.a3
    
    def backward(self, X, y):
        m = y.shape[0]
        y_one_hot = np.eye(self.W3.shape[1])[y]
        
        # 输出层误差
        output_error = self.a3 - y_one_hot
        
        # 隐藏层 2
        hidden2_error = output_error @ self.W3.T
        hidden2_delta = hidden2_error * relu_derivative(self.a2)
        
        # 隐藏层 1
        hidden1_error = hidden2_delta @ self.W2.T
        hidden1_delta = hidden1_error * relu_derivative(self.a1)

        # 更新权重和偏置
        self.W3 -= self.learning_rate * (self.a2.T @ output_error) / m
        self.b3 -= self.learning_rate * np.sum(output_error, axis=0, keepdims=True) / m
        
        self.W2 -= self.learning_rate * (self.a1.T @ hidden2_delta) / m
        self.b2 -= self.learning_rate * np.sum(hidden2_delta, axis=0, keepdims=True) / m
        
        self.W1 -= self.learning_rate * (X.T @ hidden1_delta) / m
        self.b1 -= self.learning_rate * np.sum(hidden1_delta, axis=0, keepdims=True) / m
    
    def fit(self, X, y, epochs=100, batch_size=64):
        n = X.shape[0]
        for epoch in range(epochs):
            indices = np.arange(n)
            np.random.shuffle(indices)
            losses = []
            
            for start in range(0, n, batch_size):
                end = min(start + batch_size, n)
                X_batch = X[indices[start:end]]
                y_batch = y[indices[start:end]]
                
                y_pred = self.forward(X_batch)
                loss = cross_entropy_loss(y_pred, y_batch)
                losses.append(loss)
                self.backward(X_batch, y_batch)
            
            print(f"Epoch {epoch}/{epochs}, Loss: {np.mean(losses):.4f}")

    def predict(self, X):
        y_pred = self.forward(X)
        return np.argmax(y_pred, axis=1)

# 初始化和训练模型
input_size = train_feats.shape[1]
hidden_sizes = [64, 32]
output_size = len(np.unique(train_labels))
learning_rate = 0.01

mlp = MLP(input_size, hidden_sizes, output_size, learning_rate)
mlp.fit(train_feats, train_labels, epochs=50, batch_size=64)

# 验证集评估
val_predictions = mlp.predict(val_feats)
val_accuracy = np.mean(val_predictions == val_labels)
print(f"Validation Accuracy: {val_accuracy:.4f}")

# 测试集预测
test_predictions = mlp.predict(test_feats)
test_titles = test_papers['title'].values
test_years = test_papers['year'].values
test_abstracts = test_papers['abstract'].values

# 将预测结果写入 CSV
test_categories = [list(label_map.keys())[list(label_map.values()).index(label)] for label in test_predictions]
output_file = './ml_model/dataset/test_papers_predictions.csv'
with open(output_file, mode='w', newline='', encoding='utf-8') as file:
    writer = csv.writer(file)
    writer.writerow(['title', 'category', 'year', 'abstract'])
    for title, category, year, abstract in zip(test_titles, test_categories, test_years, test_abstracts):
        writer.writerow([title, category, year, abstract])

print(f"Model predictions written to {output_file}")
