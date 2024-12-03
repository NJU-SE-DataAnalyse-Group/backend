from gensim.models.keyedvectors import KeyedVectors
import numpy as np
import pandas as pd
import flask
import faiss


def load_glove_model(glove_file):

    model = KeyedVectors.load_word2vec_format(glove_file, binary=False, no_header=True)
    return model


glove_model = load_glove_model("glove.6B.200d.txt")


print("glove model loaded successfully")


papers = pd.read_csv('./dataset/papers.csv.gz', compression='gzip')


feats = pd.read_csv('./dataset/feats.csv.gz', compression='gzip', header=None).values.astype(np.float32)


k = 10


index = faiss.IndexFlatL2(128) 
index.add(feats)  

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

