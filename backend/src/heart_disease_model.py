import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
import pickle

# Loading the csv data to a Pandas DataFrame
df = pd.read_csv('../dataset/heart_disease_data.csv')
df = df.drop(columns=['fbs', 'restecg', 'sex'])

# Splitting the features and target
X = df.drop(columns='target', axis=1)
y = df['target']

# Standardize features
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# Splitting into training and test data
X_train, X_test, y_train, y_test= train_test_split(X_scaled, y, test_size=0.2, random_state=50, stratify=y)

# Model training
model= LogisticRegression()
model.fit(X_train, y_train)

# Save the trained model using pickle
with open("heart_disease_model.pkl", "wb") as model_file:
    pickle.dump(model, model_file)

# Save the scaler using pickle
with open("heart_disease_model_scaler.pkl", "wb") as scaler_file:
    pickle.dump(scaler, scaler_file)