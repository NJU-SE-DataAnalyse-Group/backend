from gensim.models.keyedvectors import KeyedVectors
import numpy as np
import pandas as pd
import flask
import faiss

# 加载 GloVe 预训练模型
def load_glove_model(glove_file):
    # 使用 gensim 的 KeyedVectors 格式加载 GloVe
    model = KeyedVectors.load_word2vec_format(glove_file, binary=False, no_header=True)
    return model

# 假设你下载并保存了 GloVe 文件（比如 glove.6B.100d.txt）
glove_model = load_glove_model("glove.6B.200d.txt")


print("glove model loaded successfully")

# 读取论文数据
papers = pd.read_csv('./dataset/papers.csv.gz', compression='gzip')

# 读取论文的特征向量
feats = pd.read_csv('./dataset/feats.csv.gz', compression='gzip', header=None).values.astype(np.float32)

# 使用 Faiss 查询最相似的前10篇论文
k = 10

# 创建 Faiss 索引，使用 L2 距离来查找最相似的向量
index = faiss.IndexFlatL2(128)  # 128 是特征向量的维度
index.add(feats)  # 添加论文的特征向量到索引中

print("Faiss index created successfully")


app = flask.Flask(__name__)

@app.route('/search', methods=['POST'])
def search():
    user_input = flask.request.json.get('keyword', '')
    words = user_input.split()
    vectors = [glove_model[word] for word in words if word in glove_model]

    if vectors:
        user_query_vector = np.mean(vectors, axis=0)
    else:
        user_query_vector = np.zeros(glove_model.vector_size)

    user_query_vector = user_query_vector[:128]
    distances, indices = index.search(np.array([user_query_vector]), k)
    top_k_papers = papers.iloc[indices[0]]

    result = top_k_papers['title'].tolist()
    return flask.jsonify(result)

if __name__ == '__main__':
    app.run(debug=True)


# # 假设用户输入的关键词为一个字符串
# user_input = "deep learning in computer vision"

# # 将用户输入的关键词分解成单词
# words = user_input.split()

# # 获取每个单词的词向量并计算其平均值
# vectors = []
# for word in words:
#     if word in glove_model:  # 检查单词是否在模型的词汇表中
#         vectors.append(glove_model[word])

# # 如果至少有一个有效的词向量，计算平均值，否则返回一个零向量
# if vectors:
#     user_query_vector = np.mean(vectors, axis=0)  # 计算平均值
# else:
#     user_query_vector = np.zeros(glove_model.vector_size)  # 如果没有有效词向量，返回一个零向量

# # 确保得到的向量与论文特征向量的维度相同（例如128维）
# user_query_vector = user_query_vector[:128]  # 如果使用100维模型，裁剪到128维（这可能会丢失一些信息）



# distances, indices = index.search(np.array([user_query_vector]), k)

# # 获取相似论文的索引并打印相关信息
# top_k_papers = papers.iloc[indices[0]]
# top_k_papers['similarity'] = 1 - distances[0]  # 计算相似度（L2距离转化为相似度）
# print(top_k_papers[['title', 'abstract', 'category', 'year', 'similarity']])
