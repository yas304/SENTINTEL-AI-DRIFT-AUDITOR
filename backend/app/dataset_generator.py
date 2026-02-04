"""
Dataset Generator for SentinelAI
Generates three realistic credit decision datasets for auditing
"""
import numpy as np
import pandas as pd
from typing import Literal
from app.config import DATASET_SIZE, DATA_DIR

DatasetMode = Literal["clean", "biased", "drifted"]

def generate_base_features(n: int, seed: int = 42) -> pd.DataFrame:
    """Generate base customer features"""
    np.random.seed(seed)
    
    # Customer IDs
    customer_ids = [f"CUST_{i:06d}" for i in range(1, n + 1)]
    
    # Age: Normal distribution, 18-75
    ages = np.clip(np.random.normal(42, 12, n), 18, 75).astype(int)
    
    # Gender: Roughly balanced
    genders = np.random.choice(["Male", "Female"], n, p=[0.52, 0.48])
    
    # Income: Log-normal distribution, $20k-$200k
    incomes = np.clip(np.random.lognormal(10.8, 0.5, n), 20000, 200000).astype(int)
    
    # Credit score: Normal distribution, 300-850
    credit_scores = np.clip(np.random.normal(680, 80, n), 300, 850).astype(int)
    
    # Employment type
    employment_types = np.random.choice(
        ["Full-time", "Part-time", "Self-employed", "Unemployed"],
        n,
        p=[0.65, 0.15, 0.15, 0.05]
    )
    
    # Debt ratio: Beta distribution, 0-1
    debt_ratios = np.clip(np.random.beta(2, 5, n), 0, 1).round(2)
    
    return pd.DataFrame({
        "customer_id": customer_ids,
        "age": ages,
        "gender": genders,
        "income": incomes,
        "credit_score": credit_scores,
        "employment_type": employment_types,
        "debt_ratio": debt_ratios
    })

def generate_clean_dataset(n: int = DATASET_SIZE) -> pd.DataFrame:
    """
    Dataset A - CLEAN
    - Balanced approvals
    - No gender bias (DI ≈ 0.95)
    - Stable distributions
    - Accuracy ≈ 87%
    - Expected AI Risk ≈ 35 (PASS)
    """
    np.random.seed(42)
    df = generate_base_features(n, seed=42)
    
    # Fair prediction model (no gender bias)
    # Higher credit score, income, and employment stability = higher approval
    approval_probability = (
        0.3 * (df["credit_score"] - 300) / 550 +  # Credit score weight
        0.25 * (df["income"] - 20000) / 180000 +   # Income weight
        0.25 * (1 - df["debt_ratio"]) +             # Debt ratio weight
        0.2 * df["employment_type"].map({           # Employment weight
            "Full-time": 1.0,
            "Part-time": 0.6,
            "Self-employed": 0.7,
            "Unemployed": 0.2
        })
    )
    
    # Add small random noise
    approval_probability = np.clip(approval_probability + np.random.normal(0, 0.05, n), 0.1, 0.9)
    
    # Generate predictions
    df["prediction"] = (approval_probability > 0.5).astype(int)
    
    # Generate actual outcomes (87% accuracy)
    accuracy_rate = 0.87
    correct_mask = np.random.random(n) < accuracy_rate
    df["actual_outcome"] = df["prediction"].copy()
    incorrect_indices = df.index[~correct_mask]
    df.loc[incorrect_indices, "actual_outcome"] = 1 - df.loc[incorrect_indices, "prediction"]
    
    # Ensure balanced gender approval rates (DI ≈ 0.95)
    male_mask = df["gender"] == "Male"
    female_mask = df["gender"] == "Female"
    
    male_approval = df.loc[male_mask, "prediction"].mean()
    female_approval = df.loc[female_mask, "prediction"].mean()
    
    # Adjust to achieve DI ≈ 0.95
    target_di = 0.95
    if female_approval / male_approval < target_di:
        # Boost some female approvals
        female_denials = df.index[(df["gender"] == "Female") & (df["prediction"] == 0)]
        boost_count = int(len(female_denials) * 0.1)
        if boost_count > 0:
            boost_indices = np.random.choice(female_denials, boost_count, replace=False)
            df.loc[boost_indices, "prediction"] = 1
    
    return df

def generate_biased_dataset(n: int = DATASET_SIZE) -> pd.DataFrame:
    """
    Dataset B - BIASED
    - Female approval ≈ 18% lower
    - Income proxy bias present
    - Accuracy ≈ 85%
    - Expected AI Risk ≈ 72 (WARNING/FAIL)
    """
    np.random.seed(43)
    df = generate_base_features(n, seed=43)
    
    # Biased prediction model (gender bias)
    gender_penalty = df["gender"].map({"Male": 0, "Female": -0.18})
    
    approval_probability = (
        0.3 * (df["credit_score"] - 300) / 550 +
        0.25 * (df["income"] - 20000) / 180000 +
        0.25 * (1 - df["debt_ratio"]) +
        0.2 * df["employment_type"].map({
            "Full-time": 1.0,
            "Part-time": 0.6,
            "Self-employed": 0.7,
            "Unemployed": 0.2
        }) +
        gender_penalty  # Bias component
    )
    
    approval_probability = np.clip(approval_probability + np.random.normal(0, 0.05, n), 0.05, 0.95)
    
    # Generate predictions
    df["prediction"] = (approval_probability > 0.5).astype(int)
    
    # Generate actual outcomes (85% accuracy)
    accuracy_rate = 0.85
    correct_mask = np.random.random(n) < accuracy_rate
    df["actual_outcome"] = df["prediction"].copy()
    incorrect_indices = df.index[~correct_mask]
    df.loc[incorrect_indices, "actual_outcome"] = 1 - df.loc[incorrect_indices, "prediction"]
    
    return df

def generate_drifted_dataset(n: int = DATASET_SIZE) -> pd.DataFrame:
    """
    Dataset C - DRIFTED
    - Credit score mean reduced (economic downturn simulation)
    - Income distribution shifted lower
    - Accuracy ≈ 75%
    - Expected AI Risk ≈ 58 (WARNING)
    """
    np.random.seed(44)
    df = generate_base_features(n, seed=44)
    
    # Simulate drift: reduce credit scores (economic downturn)
    df["credit_score"] = np.clip(df["credit_score"] - 50, 300, 850).astype(int)
    
    # Simulate drift: reduce incomes
    df["income"] = np.clip(df["income"] * 0.85, 20000, 200000).astype(int)
    
    # Increase debt ratios
    df["debt_ratio"] = np.clip(df["debt_ratio"] * 1.2, 0, 1).round(2)
    
    # Standard prediction model (no bias, but trained on old distribution)
    approval_probability = (
        0.3 * (df["credit_score"] - 300) / 550 +
        0.25 * (df["income"] - 20000) / 180000 +
        0.25 * (1 - df["debt_ratio"]) +
        0.2 * df["employment_type"].map({
            "Full-time": 1.0,
            "Part-time": 0.6,
            "Self-employed": 0.7,
            "Unemployed": 0.2
        })
    )
    
    approval_probability = np.clip(approval_probability + np.random.normal(0, 0.05, n), 0.1, 0.9)
    
    # Generate predictions
    df["prediction"] = (approval_probability > 0.5).astype(int)
    
    # Generate actual outcomes (75% accuracy - model is degraded due to drift)
    accuracy_rate = 0.75
    correct_mask = np.random.random(n) < accuracy_rate
    df["actual_outcome"] = df["prediction"].copy()
    incorrect_indices = df.index[~correct_mask]
    df.loc[incorrect_indices, "actual_outcome"] = 1 - df.loc[incorrect_indices, "prediction"]
    
    return df

def get_dataset(mode: DatasetMode) -> pd.DataFrame:
    """Get dataset by mode"""
    generators = {
        "clean": generate_clean_dataset,
        "biased": generate_biased_dataset,
        "drifted": generate_drifted_dataset
    }
    return generators[mode]()

def get_baseline_dataset() -> pd.DataFrame:
    """Get baseline dataset for drift comparison"""
    return generate_clean_dataset()

# Pre-generate and cache datasets
def initialize_datasets():
    """Pre-generate all datasets for fast access"""
    datasets = {}
    for mode in ["clean", "biased", "drifted"]:
        datasets[mode] = get_dataset(mode)
        # Save to CSV for transparency
        datasets[mode].to_csv(DATA_DIR / f"dataset_{mode}.csv", index=False)
    return datasets

if __name__ == "__main__":
    # Generate datasets when run directly
    print("Generating datasets...")
    datasets = initialize_datasets()
    for mode, df in datasets.items():
        print(f"\n{mode.upper()} Dataset:")
        print(f"  Shape: {df.shape}")
        print(f"  Approval Rate: {df['prediction'].mean():.2%}")
        male_approval = df[df['gender'] == 'Male']['prediction'].mean()
        female_approval = df[df['gender'] == 'Female']['prediction'].mean()
        print(f"  Male Approval: {male_approval:.2%}")
        print(f"  Female Approval: {female_approval:.2%}")
        print(f"  Disparate Impact: {female_approval/male_approval:.3f}")
        accuracy = (df['prediction'] == df['actual_outcome']).mean()
        print(f"  Accuracy: {accuracy:.2%}")
