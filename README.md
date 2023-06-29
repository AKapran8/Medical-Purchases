# Test Task

NodeJS version: 18.16.0.  
This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 16.0.5.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Description

Need to develop a SPA on latest Angular to display a table with headers and data dynamically fetched from the API https://api.medzakupivli.com/appellation/type/?hash=8f7d225ffda84d9a143ca8c9868779a95cc9b033

The table headings can be taken from the description on the page https://api.medzakupivli.com/api/api.html (at the bottom of the page the description of the appellation.type model)

### Mandatory requirements

1. Implement at least 3 of the following possibilities of data operations (more will be a plus in the evaluation of the test task):  
    a. Text filter by the value of each column (one filter field per column)  
    b. Text filter by the value of any column (one field for the entire table)  
    c. Sort by the value of each column  
    d. Pagination  
    e. Selection of the number of lines to display on the page  
    f. Export table data to Excel  
    g. Ability to hide columns
2. The layout should be adaptive, stretching across the width of the page.

### Optional requirements

1. Use the PrimeNG library.
2. The possibility of creating new entries in the table and transferring the entered data in JSON format in an arbitrary structure to the endpoint https://api.medzakupivli.com/inbound_logistics/angular/?name=test where you need to transfer your last name in the test parameter.
