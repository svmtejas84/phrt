import sys
import json
import pandas as pd
import joblib
import numpy as np
import os

def load_artifacts():
    base_dir = os.path.dirname(__file__)
    model = joblib.load(os.path.join(base_dir, 'disease_predictor_model.joblib'))
    le = joblib.load(os.path.join(base_dir, 'label_encoder.joblib'))
    model_columns = joblib.load(os.path.join(base_dir, 'model_columns.joblib'))
    return model, le, model_columns

def prepare_input(data, model_columns):
    # data can be dict or list[dict]
    if isinstance(data, dict):
        df = pd.DataFrame([data])
    else:
        df = pd.DataFrame(data)
    
    # Convert all numeric columns to proper numeric types
    # Keep Gender as categorical for one-hot encoding
    for col in df.columns:
        if col == 'Gender':
            continue
        # Try to convert to numeric, coerce errors to NaN
        df[col] = pd.to_numeric(df[col], errors='coerce')
    
    # Fill any NaN values with 0
    df = df.fillna(0)
    
    # One-hot encode Gender if present
    if 'Gender' in df.columns:
        df = pd.get_dummies(df, columns=['Gender'], drop_first=True)
    
    # Align to model columns and fill missing with 0
    for col in model_columns:
        if col not in df.columns:
            df[col] = 0
    
    # Select only the model columns in the right order
    processed = df[model_columns]
    
    # Ensure ALL columns are numeric float64
    processed = processed.astype('float64', errors='ignore')
    
    return processed

def main():
    try:
        action = os.environ.get('ACTION', '').strip()
        if action == 'feature_importance':
            # Placeholder global feature importance; could be model-native if supported
            # Fallback to top features by model feature importance values if available
            model, le, model_columns = load_artifacts()
            items = []
            try:
                if hasattr(model, 'feature_importances_'):
                    importances = model.feature_importances_
                    pairs = sorted(zip(model_columns, importances), key=lambda x: x[1], reverse=True)
                    for feat, val in pairs[:6]:
                        items.append({'feature': feat, 'importance': float(val)})
                else:
                    items = []
            except Exception:
                items = []
            # Normalize 0..1 scale
            if items:
                maxv = max([i['importance'] for i in items]) or 1.0
                for i in items:
                    i['importance'] = round(i['importance'] / maxv, 2)
            print(json.dumps({ 'globalFeatureImportance': items }))
            return

        raw = sys.stdin.read()
        data = json.loads(raw) if raw else {}
        model, le, model_columns = load_artifacts()
        X = prepare_input(data, model_columns)
        
        # Debug: print dtypes before conversion
        import sys as sys2
        sys2.stderr.write(f"[DEBUG] DataFrame dtypes before astype:\n{X.dtypes.to_dict()}\n")
        sys2.stderr.flush()
        
        # Ensure all columns are explicitly float64 for the model
        X = X.astype('float64')
        
        sys2.stderr.write(f"[DEBUG] DataFrame dtypes after astype:\n{X.dtypes.to_dict()}\n")
        sys2.stderr.flush()
        
        y_pred = model.predict(X)
        y_proba = None
        try:
            y_proba = model.predict_proba(X)
        except Exception:
            y_proba = None
        
        results = []
        
        # If we have probability scores, return ALL disease predictions with their probabilities
        if y_proba is not None:
            # Get all class labels
            all_classes = le.classes_
            
            # For each input sample
            for i in range(len(X)):
                sample_results = []
                # Return probabilities for ALL diseases
                for j, disease_label in enumerate(all_classes):
                    sample_results.append({
                        'label': str(disease_label),
                        'confidence': float(y_proba[i][j] * 100)  # Convert to percentage
                    })
                results.append(sample_results)
        else:
            # Fallback: only return top prediction if predict_proba not available
            labels = le.inverse_transform(y_pred)
            for i, label in enumerate(labels):
                results.append([{
                    'label': str(label),
                    'confidence': None
                }])
        
        print(json.dumps({ 'results': results }))
    except Exception as e:
        print(json.dumps({ 'error': str(e) }))
        sys.exit(1)

if __name__ == '__main__':
    main()
