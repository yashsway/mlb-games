<template>
  <div class="container detail">
    <div class="main">
        <div class="game_day">{{ readableDate }}</div>
        <div class="innings_section" v-show="this.linescore.length!=[]">
            <table class="innings_table">
                <thead>
                    <tr>
                        <th>Team</th>
                        <th v-for="inn in linescore" v-bind:key="inn.inning">{{ inn.inning }}</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>{{ home.code.toUpperCase() }}</td>
                        <td v-for="inn in linescore" v-bind:key="inn.inning+inn.home">{{ inn.home }}</td>
                    </tr>
                    <tr>
                        <td>{{ away.code.toUpperCase() }}</td>
                        <td v-for="inn in linescore" v-bind:key="inn.inning+inn.away">{{ inn.away }}</td>
                    </tr>
                </tbody>
            </table>
        </div>
        <div class="batters_section" v-show="this.linescore.length!=[]">
            <div class="game_teams">
                <div class="toggle home_stats" v-on:click="home_default=!home_default"><span :class="home_default ? 'bold' : 'no_bold'">{{ home.name }}</span></div>
                <span class="pipe">|</span>
                <div class="toggle away_stats" v-on:click="home_default=!home_default"><span :class="!home_default ? 'bold' : 'no_bold'">{{ away.name }}</span></div>
            </div>
            <div class="game_batters">
                <el-table :data="batters.home.batter" class="batters_table" v-show="home_default">
                    <el-table-column label="Name" align="center" width="150">
                        <template slot-scope="props">
                            <p>{{ props.row.name }}</p>
                        </template>
                    </el-table-column>
                    <el-table-column :label="stat.toUpperCase()" :align="'center'" v-for="stat in batter_stats" :key="stat">
                        <template slot-scope="props">
                            <p>{{ props.row[stat] }}</p>
                        </template>
                    </el-table-column>
                </el-table>
                <el-table :data="batters.away.batter" class="batters_table" v-show="!home_default">
                    <el-table-column label="Name" align="center">
                        <template slot-scope="props">
                            <p>{{ props.row.name }}</p>
                        </template>
                    </el-table-column>
                    <el-table-column :label="stat.toUpperCase()" :align="'center'" v-for="stat in batter_stats" :key="stat">
                        <template slot-scope="props">
                            <p>{{ props.row[stat] }}</p>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
        </div>
        <div class="no_data" v-show="this.linescore.length==[]">
            No data yet!
        </div>
        <el-button type="info"><router-link :to="{ name: 'game_list', query: { gameDate: this.$route.query.gameDate }}">Back</router-link></el-button>
    </div>
    
  </div>
</template>

<script>
import axios from 'axios';
import moment from 'moment';
import _ from 'lodash';

export default {
    name: 'game_detail',
    beforeMount: function() {
        this.setData(this.$route.query.gameURL);
    },
    data() {
        return {
            gameDate: '',
            home: { 'code': '-' },
            away: { 'code': '-' },
            linescore: [],
            batters: { home: { 'batter': []}, away: { 'batter': []}},
            batter_stats: ['ab','r','h','rbi','bb','so','avg'],
            home_default: true,
        }
    },
    computed: {
        // human readable date set at start, no recalcs reqd.
        readableDate: function() {
            return moment(this.gameDate).isValid() ? moment(gameDate).format('ddd MMM DD YYYY') : moment(this.$route.query.gameDate).format('ddd MMM DD YYYY');
        }
    },
    methods: {
        // get data from MLB API based on URL provided, no defaults here
        setData: function(gameURL) {
            axios.get(`http://gd2.mlb.com${gameURL}/boxscore.json`)
            .then((response) => {
                // set once
                var mlbData = response.data.data.boxscore;
                // set home and away name + code
                this.home = {'name':mlbData.home_fname,'code':mlbData.home_team_code};
                this.away = {'name':mlbData.away_fname,'code':mlbData.away_team_code};
                // find and set innings
                this.linescore = mlbData.linescore.inning_line_score;
                // find and set game date
                this.gameDate = mlbData.date;
                // find and set batter statistics. keep individual batter statisitics only for home and away. store in separate keys.
                this.batters = {'home': _.pick(_.filter(mlbData.batting, { 'team_flag': 'home' })[0],['batter']), 'away': _.pick(_.filter(mlbData.batting, { 'team_flag': 'away' })[0],['batter'])};
            })
            .catch((error) => {
                console.log(error);
            });
        }
    }
}
</script>

<style scoped>
/* Kept styles as close to name conventions as possible. Could be incredibly more modular with PostCSS @apply and :root */
a {
  color: #000;
  text-decoration: none;
}
.container.detail {
    grid-area: data;
    align-self: stretch;
    padding: 1rem;
}
.innings_table {
    margin: 0 auto;
}
.innings_table tbody td {
    padding: 3px;
}
.innings_table thead th {
    padding: 3px;
}
.game_teams {
    margin: 2rem;
}
.toggle {
    margin: 0rem 1rem;
    display: inline-block;
    cursor: pointer;
}
.pipe {
    margin: 0rem 1.5rem;
}
.bold {
    font-weight: bold;
}
.no-bold {
    font-weight: normal;
}
.game_day {
    font-size: 2rem;
}
.no_data {
    color: #909399;
    font-size: 2rem;
    padding: 20px;
    height: 30vh;
    display: flex;
    justify-content: center;
    align-items: center;
}
</style>