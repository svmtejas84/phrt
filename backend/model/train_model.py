import pandas as pd
import lightgbm as lgb
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
import seaborn as sns
import matplotlib.pyplot as plt
import joblib
import time

# Record the start time
start_time = time.time()

# 1. Load the Dataset
print("Step 1/7: Loading the enhanced dataset...")
try:
    df = pd.read_csv('enhanced_hackathon_dataset.csv')
    print("Dataset loaded successfully.")
except FileNotFoundError:
    print("Error: 'enhanced_hackathon_dataset.csv' not found.")
    print("Please run the data generation script first to create the dataset.")
    exit()

# 2. Prepare Data for Training
print("\nStep 2/7: Preparing data for training...")
# The 'Disease' column is our target (y) - what we want to predict.
y = df['Disease']

# The features (X) are all columns EXCEPT the ones we want to predict or that are derived from the target.
# This is crucial to prevent the model from "cheating" by looking at the answers.
X = df.drop(['Disease', 'Severity', 'Recommended_Next_Step'], axis=1)

# Handle the categorical feature 'Gender' using one-hot encoding.
# This converts 'Male'/'Female' into numerical columns (e.g., 'Gender_Male').
X = pd.get_dummies(X, columns=['Gender'], drop_first=True)

# Encode the text-based target variable 'Disease' into numbers (e.g., 'Diabetes' -> 1).
le = LabelEncoder()
y_encoded = le.fit_transform(y)
print("Data preparation complete.")

# 3. Split Data into Training and Testing Sets
print("\nStep 3/7: Splitting data into training and testing sets...")
# We'll use 75% of the data for training and 25% for testing.
# 'stratify' ensures that the proportion of each disease is the same in both the train and test sets.
X_train, X_test, y_train, y_test = train_test_split(X, y_encoded, test_size=0.25, random_state=42, stratify=y_encoded)
print(f"Data split into {len(X_train)} training samples and {len(X_test)} testing samples.")

# 4. Train the Machine Learning Model
print("\nStep 4/7: Training the LightGBM model...")
# LightGBM is a powerful and fast algorithm, great for this kind of tabular data.
model = lgb.LGBMClassifier(objective='multiclass', random_state=42, n_estimators=150)
model.fit(X_train, y_train)
print("Model training complete.")

# 5. Evaluate the Model's Performance
print("\nStep 5/7: Evaluating model performance...")
# Make predictions on the unseen test data.
y_pred = model.predict(X_test)

# Calculate overall accuracy.
accuracy = accuracy_score(y_test, y_pred)
print(f"\nModel Accuracy on Test Data: {accuracy:.4f}")

# To make the report readable, we convert the numerical predictions back to disease names.
y_test_labels = le.inverse_transform(y_test)
y_pred_labels = le.inverse_transform(y_pred)

from sklearn.metrics import precision_score, recall_score, f1_score, roc_auc_score

# Show a detailed report of precision, recall, f1-score for each disease, macro/weighted averages
report = classification_report(y_test_labels, y_pred_labels, output_dict=True, zero_division=0)
print("\nClassification Report:")
print(classification_report(y_test_labels, y_pred_labels, zero_division=0))

# Macro and weighted averages
macro_precision = report['macro avg']['precision']
macro_recall = report['macro avg']['recall']
macro_f1 = report['macro avg']['f1-score']
weighted_precision = report['weighted avg']['precision']
weighted_recall = report['weighted avg']['recall']
weighted_f1 = report['weighted avg']['f1-score']

print(f"Macro Avg - Precision: {macro_precision:.4f}, Recall: {macro_recall:.4f}, F1: {macro_f1:.4f}")
print(f"Weighted Avg - Precision: {weighted_precision:.4f}, Recall: {weighted_recall:.4f}, F1: {weighted_f1:.4f}")

# ROC AUC (One-vs-Rest, only if >2 classes)
roc_auc = None
if len(le.classes_) > 2:
    try:
        y_pred_proba = model.predict_proba(X_test)
        roc_auc = roc_auc_score(y_test, y_pred_proba, multi_class='ovr')
        print(f"ROC AUC (OvR): {roc_auc:.4f}")
    except Exception as e:
        print(f"ROC AUC could not be computed: {e}")
else:
    try:
        y_pred_proba = model.predict_proba(X_test)[:, 1]
        roc_auc = roc_auc_score(y_test, y_pred_proba)
        print(f"ROC AUC: {roc_auc:.4f}")
    except Exception as e:
        print(f"ROC AUC could not be computed: {e}")

# 6. Visualize the Confusion Matrix
print("\nStep 6/7: Generating confusion matrix visualization...")
cm = confusion_matrix(y_test_labels, y_pred_labels, labels=le.classes_)
plt.figure(figsize=(16, 10))
ax = plt.gca()
sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', xticklabels=le.classes_, yticklabels=le.classes_, ax=ax)
plt.title('Confusion Matrix')
plt.ylabel('Actual Disease')
plt.xlabel('Predicted Disease')
plt.xticks(rotation=45, ha='right')
plt.yticks(rotation=0)
plt.tight_layout()

# Display metrics as text box on the plot
metrics_text = (
    f'Accuracy: {accuracy:.4f}\n'
    f'Macro F1: {macro_f1:.4f}\n'
    f'Macro Recall: {macro_recall:.4f}\n'
    f'Weighted F1: {weighted_f1:.4f}\n'
    f'Weighted Recall: {weighted_recall:.4f}\n'
    f'ROC AUC: {(roc_auc if roc_auc is not None else "N/A"):.4f}'
)
plt.text(
    1.05, 0.5,
    metrics_text,
    fontsize=14,
    color='darkblue',
    transform=ax.transAxes,
    bbox=dict(facecolor='white', edgecolor='blue', boxstyle='round,pad=0.5')
)
plt.show()

# 7. Save the Trained Model and Supporting Files
print("\nStep 7/7: Saving model and supporting files for future use...")
# This saves the "brain" of our model.
joblib.dump(model, 'disease_predictor_model.joblib')

# This saves the label encoder, which we need to decode predictions later.
joblib.dump(le, 'label_encoder.joblib')

# This saves the exact column order the model was trained on, which is crucial for prediction.
joblib.dump(X.columns.tolist(), 'model_columns.joblib')

end_time = time.time()
print(f"\n--- Process Complete in {end_time - start_time:.2f} seconds ---")
print("You now have a trained model saved as 'disease_predictor_model.joblib'.")
print("You are ready to integrate this into a frontend application.")