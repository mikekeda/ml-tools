// src/ml_tools/Dota2WinPrediction/Dota2WinPrediction.js
import React, {useState, useMemo, useCallback} from 'react';
import axios from 'axios';

import {Box, Button, Card, CardActionArea, Grid, IconButton, Snackbar, Typography} from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'; // Import MUI check circle icon
import CloseIcon from '@mui/icons-material/Close';
import Tooltip from '@mui/material/Tooltip';

import DotaHeroAvatar from './DotaHeroAvatar'; // Import your Dota hero avatars

const Dota2WinPrediction = () => {
  const [selectedHeroesTeam1, setSelectedHeroesTeam1] = useState([]);
  const [selectedHeroesTeam2, setSelectedHeroesTeam2] = useState([]);
  const [winProbability, setWinProbability] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const heroesByAttribute = useMemo(() => {
    const heroes = { agi: [], str: [], int: [], all: [] };
    DotaHeroAvatar.forEach((hero) => {
      heroes[hero.primary_attr].push(hero);
    });
    return heroes;
  }, []);

  const handleRemoveHero = useCallback((heroId, team) => {
    if (team === 1) {
      const updatedTeam1 = selectedHeroesTeam1.filter((id) => id !== heroId);
      setSelectedHeroesTeam1(updatedTeam1);
    } else if (team === 2) {
      const updatedTeam2 = selectedHeroesTeam2.filter((id) => id !== heroId);
      setSelectedHeroesTeam2(updatedTeam2);
    }
    setWinProbability(null); // Reset the win probability when heroes are removed
  }, [selectedHeroesTeam1, selectedHeroesTeam2]); // Include all dependencies

  const handleHeroSelect = useCallback((heroId) => {
    if (selectedHeroesTeam1.includes(heroId)) {
      handleRemoveHero(heroId, 1);
    } else if (selectedHeroesTeam2.includes(heroId)) {
      handleRemoveHero(heroId, 2);
    } else if (selectedHeroesTeam1.length < 5) {
      // If not, add the hero to Team 1
      setSelectedHeroesTeam1([...selectedHeroesTeam1, heroId]);
    } else if (selectedHeroesTeam2.length < 5) {
      // If Team 1 has 5 heroes, add the hero to Team 2 if not already selected by Team 2
      setSelectedHeroesTeam2([...selectedHeroesTeam2, heroId]);
    } else {
      setErrorMessage("All heroes are already selected. Remove a hero to add a new one.");
    }
  }, [selectedHeroesTeam1, selectedHeroesTeam2, handleRemoveHero]); // Include all dependencies

  const getHeroSelectionStatus = (heroId) => {
    if (selectedHeroesTeam1.includes(heroId)) {
      return "Click to deselect this hero from team 1";
    } else if (selectedHeroesTeam2.includes(heroId)) {
      return "Click to deselect this hero from team 2";
    } else if (selectedHeroesTeam1.length < 5) {
      return "Click to select this hero for team 1";
    } else if (selectedHeroesTeam2.length < 5) {
      return "Click to select this hero for team 2";
    } else {
      return "Cannot select more heroes";
    }
  };

  const handleSendSelection = () => {
    // Construct the query string with team1 and team2 hero IDs
    const queryString = `?team1=${selectedHeroesTeam1.join(',')}&team2=${selectedHeroesTeam2.join(',')}`;
    const baseUrl = window.location.hostname === 'localhost' 
    ? 'http://localhost:8000' 
    : `http://${window.location.hostname}`;

    setIsLoading(true); // Start loading while fetching the prediction
    axios
      .get(`${baseUrl}/api/ml-tools/dota2-win-prediction${queryString}`)
      .then((response) => {
        // Handle success
        setWinProbability(response.data);
        setIsLoading(false); // Stop loading after the prediction is received
      })
      .catch((error) => {
        // Handle error
        setWinProbability(null); // Reset or handle the error state appropriately
        setIsLoading(false); // Stop loading if there's an error
        const message = error.response?.data?.message || "An error occurred while fetching the data.";
        setErrorMessage(message);
      });
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setErrorMessage("");
  };

  return (
    <div>
      <Typography variant="h3" gutterBottom>Dota 2 Win Prediction</Typography>
      <Typography variant="subtitle1" style={{marginBottom: '1rem'}}>
        Trained on <b>570,286</b> matches from <a href="https://opendota.com" rel="noreferrer" target="_blank">opendota.com</a> data as of <b>April 10, 2024</b>, with a <b>67%</b> accuracy rate.<br/>
        To predict the winning team, select <b>5</b> heroes for each team. Selected heroes are marked. To deselect a hero,
        click on them again.
      </Typography>
      {/* Render Dota hero avatars and handle selection */}
      <Grid container spacing={3} justify="center">
        <Grid item xs={12} sm={6}>
          <Typography variant="h4" gutterBottom>Team 1</Typography>
          <Grid container spacing={1}>
            {selectedHeroesTeam1.map((heroId) => {
              const hero = DotaHeroAvatar.find((h) => h.id === heroId);
              return (
                <Grid item key={heroId} xs={12} sm={6} md={4} lg={2}>
                  <Tooltip title="Click to remove this hero" placement="top">
                    <img
                      key={hero.id}
                      src={hero.avatar}
                      alt={`Hero ${hero.name}`} // Provide a meaningful description
                      aria-label={selectedHeroesTeam1.includes(hero.id) || selectedHeroesTeam2.includes(hero.id) ? "Remove hero from selection" : "Add hero to selection"}
                      onClick={() => handleRemoveHero(heroId, 1)}
                      style={{cursor: 'pointer', width: '100%', marginBottom: '8px'}}
                    />
                  </Tooltip>
                </Grid>
              );
            })}
          </Grid>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Typography variant="h4" gutterBottom>Team 2</Typography>
          <Grid container spacing={1}>
            {selectedHeroesTeam2.map((heroId) => {
              const hero = DotaHeroAvatar.find((h) => h.id === heroId);
              return (
                <Grid item key={heroId} xs={12} sm={6} md={4} lg={2}>
                  <Tooltip title="Click to remove this hero" placement="top">
                    <img
                      key={hero.id}
                      src={hero.avatar}
                      alt={`Hero ${hero.name}`} // Provide a meaningful description
                      aria-label={selectedHeroesTeam1.includes(hero.id) || selectedHeroesTeam2.includes(hero.id) ? "Remove hero from selection" : "Add hero to selection"}
                      onClick={() => handleRemoveHero(heroId, 1)}
                      style={{cursor: 'pointer', width: '100%', marginBottom: '8px'}}
                    />
                  </Tooltip>
                </Grid>
              );
            })}
          </Grid>
        </Grid>

        {/* Win Probability */}
        <Grid item xs={12}>
          <Grid container justifyContent="center" spacing={2}>
            <Grid item xs={12}>
              <Box display="flex" justifyContent="center" alignItems="center">
                <Typography variant="h4">
                  Team 1 Win Probability:{' '}
                  {isLoading
                    ? <><CircularProgress size={24} style={{ verticalAlign: 'middle' }} /> Calculating...</>
                    : winProbability !== null
                      ? `${(winProbability * 100).toFixed(0)}%`
                      : '?'}
                </Typography>
              </Box>
            </Grid>
            <Grid item>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSendSelection}
                disabled={selectedHeroesTeam1.length !== 5 || selectedHeroesTeam2.length !== 5}
                aria-label="Calculate the probability of team 1 winning"
              >
                Predict Winner
              </Button>
            </Grid>
          </Grid>
        </Grid>

        {/* All Heroes */}
        <Grid container spacing={1}>
          <Grid item xs={12}>
            <Typography variant="h4" gutterBottom>All Heroes</Typography>
            {Object.keys(heroesByAttribute).map((attribute) => (
              <div key={attribute} className='myCustomClass'>
                <Typography variant="h5">{attribute.toUpperCase()}</Typography>
                <Grid container spacing={1}>
                  {heroesByAttribute[attribute].map((hero) => {
                    const heroStatusText = getHeroSelectionStatus(hero.id);
                    return (
                    <Grid item key={hero.id} xs={6} sm={4} md={2} lg={1}>
                      <Card>
                        <CardActionArea
                          onClick={() => handleHeroSelect(hero.id)}
                          disabled={selectedHeroesTeam1.length >= 5 && selectedHeroesTeam2.length >= 5 && !selectedHeroesTeam1.includes(hero.id) && !selectedHeroesTeam2.includes(hero.id)}
                          style={{
                            borderLeft: selectedHeroesTeam1.includes(hero.id) ? '4px solid green' : 'none',
                            borderRight: selectedHeroesTeam2.includes(hero.id) ? '4px solid red' : 'none',
                            borderBottom: selectedHeroesTeam1.includes(hero.id) ? '2px solid green' : 'none',
                            borderTop: selectedHeroesTeam2.includes(hero.id) ? '2px solid red' : 'none',
                          }}
                          >
                          {selectedHeroesTeam1.includes(hero.id) && (
                            <CheckCircleOutlineIcon style={{ color: 'green', position: 'absolute', top: 0, left: 0 }} />
                          )}
                          {selectedHeroesTeam2.includes(hero.id) && (
                            <CheckCircleOutlineIcon style={{ color: 'red', position: 'absolute', top: 0, right: 0 }} />
                          )}
                          <Tooltip title={heroStatusText} placement="top">
                            <img
                              src={hero.avatar}
                              alt={`Hero ${hero.name}`} // Provide a meaningful description
                              aria-label={heroStatusText}
                              style={{
                                width: '100%',
                                transition: 'transform 0.2s, opacity 0.2s', // Smooth transition for transform and opacity
                                transform: selectedHeroesTeam1.includes(hero.id) || selectedHeroesTeam2.includes(hero.id) ? 'scale(0.9)' : 'scale(1)', // Scale down the image when selected
                                opacity: selectedHeroesTeam1.includes(hero.id) || selectedHeroesTeam2.includes(hero.id) ? 0.5 : 1, // Reduce opacity for selected heroes
                              }}
                            />
                          </Tooltip>
                        </CardActionArea>
                      </Card>
                    </Grid>
                    );
                  })}
                </Grid>
              </div>
            ))}
          </Grid>
        </Grid>
      </Grid>

      <Snackbar
        open={errorMessage !== ""}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        message={errorMessage}
        aria-describedby="client-snackbar"
        action={
          <IconButton size="small" aria-label="close" color="inherit" onClick={handleCloseSnackbar}>
            <CloseIcon fontSize="small"/>
          </IconButton>
        }
      />
    </div>
  );
};

export default Dota2WinPrediction;
