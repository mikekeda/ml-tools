import os

import torch
import torch.nn as nn
import torch.nn.functional as F

HEROES_IN_DOTA = 124
DEVICE = torch.device("cpu")  # cpu, gpu, mps


class HeroInteractionModel(nn.Module):
    def __init__(self, num_heroes: int, hidden_dim: int):
        super(HeroInteractionModel, self).__init__()
        self.num_heroes = num_heroes
        # Define layers for processing individual team inputs
        self.fc_team = nn.Linear(num_heroes, hidden_dim)

        # Define layers for processing interactions between teams
        self.fc_synergy = nn.Linear(hidden_dim, hidden_dim)
        self.fc_counter = nn.Linear(hidden_dim, hidden_dim)

        # Define layers for combining features and making final prediction
        self.fc_combined = nn.Linear(hidden_dim * 2, hidden_dim)
        self.fc_final = nn.Linear(hidden_dim, 1)
        self.dropout = nn.Dropout(0.5)
        self.sigmoid = nn.Sigmoid()

    def forward(self, radiant_input, dire_input):
        # Process each team's input through a shared layer
        radiant_hidden = F.relu(self.fc_team(radiant_input))
        dire_hidden = F.relu(self.fc_team(dire_input))

        # Model synergies within each team
        radiant_synergy = F.relu(self.fc_synergy(radiant_hidden))
        dire_synergy = F.relu(self.fc_synergy(dire_hidden))

        # Model counter-picks between teams
        radiant_counter = F.relu(self.fc_counter(radiant_hidden - dire_hidden))
        dire_counter = F.relu(self.fc_counter(dire_hidden - radiant_hidden))

        # Combine features from synergies and counter-picks
        combined_features = torch.cat(
            (radiant_synergy + radiant_counter, dire_synergy + dire_counter), dim=1
        )
        combined_features = self.dropout(combined_features)

        # Final prediction layer
        combined_features = F.relu(self.fc_combined(combined_features))
        output = self.sigmoid(self.fc_final(combined_features))
        return output


# Parameters
num_heroes = HEROES_IN_DOTA  # Total number of heroes
hidden_dim = 256  # Size of hero embedding

# Instantiate the model
dota2_prediction_model = HeroInteractionModel(num_heroes, hidden_dim)

pwd = os.path.dirname(os.path.realpath(__file__))
path = os.path.join(pwd, "HeroInteractionModel.pt")

dota2_prediction_model.load_state_dict(torch.load(path))


def predict_radiant_win(radiant_heroes: list[int], dire_heroes: list[int]) -> float:
    # Preprocess input: one-hot encoding
    radiant_input = torch.zeros(1, dota2_prediction_model.num_heroes)
    dire_input = torch.zeros(1, dota2_prediction_model.num_heroes)

    # Set corresponding indices to 1 for radiant heroes
    radiant_input[0, radiant_heroes] = 1
    # Set corresponding indices to 1 for dire heroes
    dire_input[0, dire_heroes] = 1

    # Forward pass through the model
    with torch.no_grad():
        dota2_prediction_model.eval()  # Set the model to evaluation mode
        output = dota2_prediction_model(radiant_input, dire_input)

    # Probability of Radiant team winning
    radiant_win_probability = output.item()

    return radiant_win_probability
