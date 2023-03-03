# Mobi fav stations

#### TODO

- [x] load station information
- [x] load station status
- [x] add station to favourites
- [x] remove station from favourites
- [x] edit station description
- [x] show favourites
- [x] search station
- [ ] change order of favourites

Documentation for the API https://gbfs.mobilitydata.org/specification/reference/

```
open app
    ⬇
show list of favourite stations
    ⬇
show button to load stations status
    ⬇
show button to update stations information
    ⬇
show button to edit favourite stations

=======================================

click button to load stations status
    ⬇
fetch `station_status.json`
    ⬇
merge data into localstorage
    ⬇
show status of favourite stations

=======================================

click button to update stations information
    ⬇
fetch `station_information.json`
    ⬇
merge data into localstorage
    ⬇
show list of favourite stations

=======================================

click button to edit favourite stations
    ⬇
show list of all stations with their information from localstorage
    ⬇
show button to update stations information
```
