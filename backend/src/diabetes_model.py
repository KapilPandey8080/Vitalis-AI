import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn import svm
from sklearn.metrics import accuracy_score
import pickle

# Loading the diabetes dataset to a pandas DataFrame
df = pd.read_csv('../dataset/diabetes_data.csv')

df.drop(columns='Pregnancies', axis=1, inplace=True)

# Separating the data and labels
X = df.drop(columns = 'Outcome', axis=1)
y = df['Outcome']
print(X.shape, y.shape)

# Data Standardization
scaler = StandardScaler()
scaler.fit(X)
X_scaled= scaler.transform(X)

X= X_scaled

# Train Test Split
X_train, X_test, y_train, y_test = train_test_split(X,y, test_size = 0.2, stratify=y, random_state=2)
print(X.shape, X_train.shape, X_test.shape)


# Model training
model= svm.SVC(kernel='linear', probability=True)
model.fit(X_train, y_train)

# Save the trained model using pickle
with open("diabetes_model.pkl", "wb") as model_file:
    pickle.dump(model, model_file)

# Save the scaler using pickle
with open("diabetes_model_scaler.pkl", "wb") as scaler_file:
    pickle.dump(scaler, scaler_file)