import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
import pickle

# Avoid future warning
pd.set_option("future.no_silent_downcasting", True)

# Load dataset
df = pd.read_csv("../dataset/breast_cancer_data.csv")

# Drop unwanted columns
df.drop(columns=["id", "Unnamed: 32"], inplace=True, errors="ignore")

# Encode diagnosis column: M = 1 (Malignant), B = 0 (Benign)
df["diagnosis"] = df["diagnosis"].replace({"M": 1, "B": 0}).astype(int)

# Select relevant features
selected_features = [
    "radius_mean",
    "perimeter_mean",
    "area_mean",
    "concavity_mean",
    "concave points_mean",
    "compactness_mean",
    "texture_mean",
    "smoothness_mean",
    "symmetry_mean",
    "fractal_dimension_mean",
]

X = df[selected_features]
y = df["diagnosis"]

# Standardize features
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# Split dataset
X_train, X_test, y_train, y_test = train_test_split(
    X_scaled, y, test_size=0.2, random_state=2, stratify=y
)

# Train Logistic Regression model
model = LogisticRegression()
model.fit(X_train, y_train)

'''
# Save the trained model using pickle
with open("breast_cancer_model.pkl", "wb") as model_file:
    pickle.dump(model, model_file)

# Save the scaler using pickle
with open("breast_cancer_model_scaler.pkl", "wb") as scaler_file:
    pickle.dump(scaler, scaler_file)
'''
