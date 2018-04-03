# Cardinal Advising Sports Analytics Platform

For Organizational purposes:
1) The primary case is to power our own web application that will serve as the Cardinal interface to the analysis. 
2) The second is to serve as a rest API to which we can give Kinexion access such that they may pull the appropriate data to power the analytics portion of their platform.

The ideal state is to be able to send a request to the server and have it return a JSON object which includes the data points to be displayed and the associated formatting for each value. At this point, our goal is to keep our "secret sauce" (the rules that define formatting changes as much on our servers as possible. _This description fits within the MVC framework we are planning to use to construct the app._

Weiqi is going to keep us posted on what database work needs to be done. Daniel and Bradley can build the necessary tables to execute. 

If we need to batch process, Bradley can set up airflow and we can use that for any necessary ETL. alternatively, we can define a series of views in PostGres that will execute all the transformations as well.

We can take advantage of the project management features in Github to track progress and make sure we're doing everything we need to do to make this as seamless as possible.

# Goal 
Have a prototype that replicates the R dashboards used last season and the associated REST API for Kinexion by *October 1*.
