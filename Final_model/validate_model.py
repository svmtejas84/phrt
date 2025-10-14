import pandas as pd
import lightgbm as lgb
from sklearn.model_selection import StratifiedKFold, cross_val_score
from sklearn.preprocessing import LabelEncoder
import numpy as np
import time


def main():
    print("--- Starting Robust Model Validation using K-Fold Cross-Validation ---")
    start_time = time.time()

    # 1. Load the Dataset
    print("\nStep 1/5: Loading the enhanced dataset...")
    try:
        df = pd.read_csv('enhanced_hackathon_dataset.csv')
        print("Dataset loaded successfully.")
    except FileNotFoundError:
        print("Error: 'enhanced_hackathon_dataset.csv' not found.")
        print("Please run the data generation script first.")
        exit()

    # 2. Prepare Data for Validation
    print("\nStep 2/5: Preparing full dataset for cross-validation...")
    y = df['Disease']
    X = df.drop(['Disease', 'Severity', 'Recommended_Next_Step'], axis=1)

    # Preprocess features and target variable
    X = pd.get_dummies(X, columns=['Gender'], drop_first=True)
    le = LabelEncoder()
    y_encoded = le.fit_transform(y)
    print("Data preparation complete.")

    # 3. Define the Model
    print("\nStep 3/5: Defining the LightGBM model...")
    # We use the same model configuration as in the training script
    model = lgb.LGBMClassifier(objective='multiclass', random_state=42, n_estimators=150)

    # 4. Set Up and Run Cross-Validation
    print("\nStep 4/5: Setting up and running 5-Fold Cross-Validation...")
    # StratifiedKFold is best for classification to ensure each fold has a similar class distribution.
    # n_splits=5 means we will run 5 rounds of training/testing.
    # shuffle=True randomizes the data before splitting.
    cv_strategy = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)

    # cross_val_score automates the entire process of splitting, training, and scoring for each fold.
    # 'scoring='accuracy'' tells it what metric to calculate.
    # n_jobs=-1 uses all available CPU cores to speed up the process.
    scores = cross_val_score(model, X, y_encoded, cv=cv_strategy, scoring='accuracy', n_jobs=-1)

    print("Cross-validation finished.")

    # 5. Report the Results
    print("\n--- Cross-Validation Results ---")
    print(f"Scores for each of the 5 folds: {np.round(scores, 4)}")
    print(f"\nAverage Accuracy (Mean): {scores.mean():.4f}")
    print(f"Standard Deviation of Accuracy: {scores.std():.4f}")

    end_time = time.time()
    print(f"\nValidation process completed in {end_time - start_time:.2f} seconds.")

    print("\n--- Interpretation ---")
    print("The 'Average Accuracy' is the most reliable estimate of your model's performance.")
    print("The 'Standard Deviation' shows how much the performance varied between different folds. A low value is good, indicating consistency.")


if __name__ == "__main__":
    main()