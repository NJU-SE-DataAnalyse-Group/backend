import pandas as pd
import numpy as np
import csv

# Read abstract, category, year of each paper
papers = pd.read_csv(f'./ml_model/dataset/papers.csv.gz', compression='gzip')
# Read the embedding vector of each paper
feats = pd.read_csv(f'./ml_model/dataset/feats.csv.gz', compression='gzip', header=None).values.astype(np.float32)
# Read the citation relations between papers
edges = pd.read_csv(f'./ml_model/dataset/edges.csv.gz', compression='gzip', header=None).values.T.astype(np.int32)
citer, citee = edges

# Split the dataset into training, validation, and test sets based on the year
train_papers = papers[papers['year'] <= 2017]
val_papers = papers[papers['year'] == 2018]
test_papers = papers[papers['year'] >= 2019]

# Extract the features for each set
train_feats = feats[train_papers.index]
val_feats = feats[val_papers.index]
test_feats = feats[test_papers.index]

# Extract the labels for training and validation sets
train_labels = train_papers['category'].values
val_labels = val_papers['category'].values

# The test set labels are not provided
test_labels = None  # You don't have labels for the test set
# 1. 手动实现特征标准化
def standardize_features(X):
    # 计算每列的均值和标准差
    mean = np.mean(X, axis=0)
    std = np.std(X, axis=0)
    # 标准化处理
    X_standardized = (X - mean) / std
    return X_standardized

# 2. 手动实现标签编码
def label_encode(labels):
    # 获取所有标签的唯一值
    unique_labels = np.unique(labels)
    label_to_int = {label: idx for idx, label in enumerate(unique_labels)}
    # 转换标签
    encoded_labels = np.array([label_to_int[label] for label in labels])
    return encoded_labels, label_to_int

# 假设我们有训练集、验证集和测试集的特征和标签
# feats 是特征矩阵，train_papers, val_papers, test_papers 是数据集
# train_labels, val_labels 是标签，假设这些标签是字符串

# 手动标准化特征
train_feats = standardize_features(train_feats)
val_feats = standardize_features(val_feats)  # 使用训练集的均值和标准差来标准化验证集和测试集
test_feats = standardize_features(test_feats)

# 手动标签编码
train_labels, label_map = label_encode(train_labels)
val_labels = label_encode(val_labels)[0]


class MLP:
    def __init__(self, input_size, hidden_sizes, output_size, learning_rate=0.01):
        self.learning_rate = learning_rate
        self.hidden_sizes = hidden_sizes
        
        # 初始化权重和偏置
        self.W1 = np.random.randn(input_size, hidden_sizes[0]) * 0.01
        self.b1 = np.zeros((1, hidden_sizes[0]))
        
        self.W2 = np.random.randn(hidden_sizes[0], hidden_sizes[1]) * 0.01
        self.b2 = np.zeros((1, hidden_sizes[1]))
        
        self.W3 = np.random.randn(hidden_sizes[1], output_size) * 0.01
        self.b3 = np.zeros((1, output_size))

    def sigmoid(self, x):
        return 1 / (1 + np.exp(-x))
    
    def sigmoid_derivative(self, x):
        return x * (1 - x)

    def forward(self, X):
        self.z1 = X @ self.W1 + self.b1
        self.a1 = self.sigmoid(self.z1)
        self.z2 = self.a1 @ self.W2 + self.b2
        self.a2 = self.sigmoid(self.z2)
        self.z3 = self.a2 @ self.W3 + self.b3
        self.a3 = self.sigmoid(self.z3)  # Output layer
        return self.a3
    
    def backward(self, X, y):
        m = y.shape[0]
        
        # 反向传播时，确保标签 y 是 one-hot 编码形式
        output_error = self.a3 - y
        output_delta = output_error * self.sigmoid_derivative(self.a3)

        hidden2_error = output_delta.dot(self.W3.T)
        hidden2_delta = hidden2_error * self.sigmoid_derivative(self.a2)

        hidden1_error = hidden2_delta.dot(self.W2.T)
        hidden1_delta = hidden1_error * self.sigmoid_derivative(self.a1)

        # 更新权重和偏置
        self.W3 -= self.a2.T.dot(output_delta) * self.learning_rate
        self.b3 -= np.sum(output_delta, axis=0, keepdims=True) * self.learning_rate

        self.W2 -= self.a1.T.dot(hidden2_delta) * self.learning_rate
        self.b2 -= np.sum(hidden2_delta, axis=0, keepdims=True) * self.learning_rate

        self.W1 -= X.T.dot(hidden1_delta) * self.learning_rate
        self.b1 -= np.sum(hidden1_delta, axis=0, keepdims=True) * self.learning_rate
    
    def fit(self, X, y, epochs=1000, batch_size=64):
        n = X.shape[0]
        num_classes = np.max(y) + 1  # 假设类别从 0 到 num_classes-1
        
        # 将标签 y 转换为 one-hot 编码
        y_one_hot = np.eye(num_classes)[y]

        for epoch in range(epochs):
            indices = np.arange(n)
            np.random.shuffle(indices)  # 打乱数据
            for start in range(0, n, batch_size):
                end = min(start + batch_size, n)
                X_batch = X[indices[start:end]]
                y_batch = y_one_hot[indices[start:end]]
        
                self.a3 = self.forward(X_batch)
                self.backward(X_batch, y_batch)

            if epoch % 100 == 0:
                loss = np.mean(np.square(y_batch - self.a3))  # 使用平方误差计算损失
                print(f"Epoch {epoch}, Loss: {loss}")

    def predict(self, X):
        output = self.forward(X)
        return np.argmax(output, axis=1)  # 返回概率最高的类别

# 初始化模型
input_size = train_feats.shape[1]
hidden_sizes = [64, 32]  # 两个隐藏层
output_size = len(np.unique(train_labels)) 
learning_rate = 0.01

mlp = MLP(input_size, hidden_sizes, output_size, learning_rate)

# 训练模型
mlp.fit(train_feats, train_labels, epochs=1, batch_size=64)

# 使用验证集进行评估
val_predictions = mlp.predict(val_feats)
val_accuracy = np.mean(val_predictions == val_labels)
print(f"Validation Accuracy: {val_accuracy:.4f}")

test_predictions = mlp.predict(test_feats)

# 获取测试集标题
test_titles = test_papers['title'].values



# 将预测标签（整数）映射回类别名称
test_categories = [list(label_map.keys())[list(label_map.values()).index(label)] for label in test_predictions]



# 获取测试集年份和摘要
test_years = test_papers['year'].values
test_abstracts = test_papers['abstract'].values

# 写入 CSV 文件
output_file = './ml_model/dataset/test_papers_predictions.csv'
with open(output_file, mode='w', newline='', encoding='utf-8') as file:
    writer = csv.writer(file)
    writer.writerow(['title', 'category', 'year', 'abstract'])  # 写入头部
    for title, category, year, abstract in zip(test_titles, test_categories, test_years, test_abstracts):
        writer.writerow([title, category, year, abstract])

print(f"model predict result write to {output_file}")