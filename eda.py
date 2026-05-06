import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import os

def main():
    # Set seaborn style for better aesthetics
    sns.set_theme(style="whitegrid")

    # Load cleaned dataset
    try:
        df = pd.read_csv("cleaned_appointment_data.csv")
    except FileNotFoundError:
        print("Please ensure 'cleaned_appointment_data.csv' is in this directory.")
        return

    # Convert dates back to datetime, as read_csv reads them as strings
    df['scheduledday'] = pd.to_datetime(df['scheduledday']).dt.tz_localize(None)
    df['appointmentday'] = pd.to_datetime(df['appointmentday']).dt.tz_localize(None)

    # ---------------------------------------------------------
    # FEATURE ENGINEERING
    # ---------------------------------------------------------
    
    # 5. Create "waiting_days"
    # To calculate accurately, we normalize the timestamps to midnight to ignore hour/time artifacts.
    df['waiting_days'] = (df['appointmentday'].dt.normalize() - df['scheduledday'].dt.normalize()).dt.days

    # Remove any negative waiting days as they are impossible (appointments before scheduled day)
    negative_wait = df[df['waiting_days'] < 0]
    print(f"Removing {len(negative_wait)} rows where waiting_days < 0...")
    df = df[df['waiting_days'] >= 0]

    # 7. Extract day of the week
    df['day_of_week'] = df['appointmentday'].dt.day_name()

    # Create folder for plots
    os.makedirs("eda_plots", exist_ok=True)

    print("\nStarting Exploratory Data Analysis (EDA) ...")

    # ---------------------------------------------------------
    # 1. Overall Distribution of No-show
    # ---------------------------------------------------------
    plt.figure(figsize=(6,5))
    ax = sns.countplot(data=df, x='no_show', palette='Set2')
    plt.title("Overall Distribution of No-Shows")
    plt.xlabel("Did the patient show up? (No-Show)")
    plt.ylabel("Number of Patients")
    
    total = len(df)
    for p in ax.patches:
        percentage = f'{100 * p.get_height() / total:.1f}%\n({p.get_height()})'
        x = p.get_x() + p.get_width() / 2
        y = p.get_height()
        ax.annotate(percentage, (x, y), ha='center', va='bottom', fontsize=11)

    plt.tight_layout()
    plt.savefig("eda_plots/1_noshow_distribution.png")
    plt.close()

    noshow_rates = df['no_show'].value_counts(normalize=True)*100
    print(f"1. Overall distribution: {noshow_rates['No']:.1f}% showed up, while {noshow_rates['Yes']:.1f}% missed their appointments.")

    # ---------------------------------------------------------
    # 2. Age vs No-show
    # ---------------------------------------------------------
    plt.figure(figsize=(10,6))
    sns.histplot(data=df, x='age', hue='no_show', multiple="stack", bins=30, palette="Set1")
    plt.title("Patient Age Distribution by No-show Status")
    plt.xlabel("Age")
    plt.ylabel("Count")
    plt.tight_layout()
    plt.savefig("eda_plots/2_age_vs_noshow.png")
    plt.close()

    print("2. Age vs No-show: Analyzed distribution of age. Young patients (0-10) and adults (40-60) show higher general traffic.")

    # ---------------------------------------------------------
    # 3. Gender vs No-show
    # ---------------------------------------------------------
    plt.figure(figsize=(6,5))
    sns.countplot(x='gender', hue='no_show', data=df, palette='Pastel1')
    plt.title("Gender vs No-show")
    plt.xlabel("Gender (F = Female, M = Male)")
    plt.ylabel("Patient Count")
    plt.tight_layout()
    plt.savefig("eda_plots/3_gender_vs_noshow.png")
    plt.close()

    females = df[df['gender'] == 'F']
    males = df[df['gender'] == 'M']
    f_rate = (females['no_show'] == 'Yes').mean() * 100
    m_rate = (males['no_show'] == 'Yes').mean() * 100
    print(f"3. Gender analysis: Women make up the majority of patients. No-show rate for Females: {f_rate:.1f}%, Males: {m_rate:.1f}%. Rates are nearly identical.")

    # ---------------------------------------------------------
    # 4. SMS Received vs No-show
    # ---------------------------------------------------------
    plt.figure(figsize=(6,5))
    sns.countplot(x='sms_received', hue='no_show', data=df, palette='Set3')
    plt.title("SMS Received vs No-show")
    plt.xlabel("SMS Received (0 = No, 1 = Yes)")
    plt.ylabel("Count")
    plt.tight_layout()
    plt.savefig("eda_plots/4_sms_vs_noshow.png")
    plt.close()

    sms_no = df[df['sms_received'] == 0]
    sms_yes = df[df['sms_received'] == 1]
    rate_sms_no = (sms_no['no_show'] == 'Yes').mean() * 100
    rate_sms_yes = (sms_yes['no_show'] == 'Yes').mean() * 100
    print(f"4. SMS behavior: No SMS received -> {rate_sms_no:.1f}% no-show. SMS received -> {rate_sms_yes:.1f}% no-show.")

    # ---------------------------------------------------------
    # 6. Waiting Days vs No-show
    # ---------------------------------------------------------
    # To reduce noise, we'll cap waiting days visually or group them
    plt.figure(figsize=(10,5))
    # We'll plot average no-show rate for small buckets
    # Create bin
    bins = [-1, 0, 7, 14, 30, 180]
    labels = ['Same Day', '1-7 Days', '8-14 Days', '15-30 Days', '31+ Days']
    df['waiting_group'] = pd.cut(df['waiting_days'], bins=bins, labels=labels)
    
    # Plot proportion
    prop_df = (df.groupby('waiting_group')['no_show'].value_counts(normalize=True).unstack()['Yes'] * 100).reset_index()
    sns.barplot(x='waiting_group', y='Yes', data=prop_df, palette="Blues_d")
    plt.title("No-show Rate (%) by Waiting Time Bucket")
    plt.xlabel("Waiting Period")
    plt.ylabel("No-Show Rate (%)")
    plt.tight_layout()
    plt.savefig("eda_plots/5_waitingdays_vs_noshow.png")
    plt.close()

    same_day_rate = prop_df[prop_df['waiting_group'] == 'Same Day']['Yes'].values[0]
    long_wait_rate = prop_df[prop_df['waiting_group'] == '31+ Days']['Yes'].values[0]
    print(f"5. Waiting time: Same day appointments have a {same_day_rate:.1f}% no-show rate, compared to {long_wait_rate:.1f}% for 31+ days.")

    # ---------------------------------------------------------
    # 7. Day of the week vs No-show
    # ---------------------------------------------------------
    plt.figure(figsize=(9,5))
    order = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    sns.countplot(data=df, x='day_of_week', hue='no_show', order=order, palette='muted')
    plt.title("Appointments Count by Day of the Week")
    plt.xlabel("Day of the Week")
    plt.ylabel("Count")
    plt.tight_layout()
    plt.savefig("eda_plots/6_dayofweek_vs_noshow.png")
    plt.close()

    day_rate = (df[df['day_of_week'] == 'Monday']['no_show'] == 'Yes').mean() * 100
    print(f"6. Day of the Week: Monday no-show rate is around {day_rate:.1f}%. Weekends (Saturday) have very low volume in general.")
    
    print("\nEDA Completed! All visualizations saved to the 'eda_plots' directory.")

if __name__ == "__main__":
    main()
