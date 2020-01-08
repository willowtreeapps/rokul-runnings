export const screenshotResponse: string = `<html>

<head>
	<meta charset="utf-8">
	<meta name="HandheldFriendly" content="True">
	<title> Roku Development Kit </title>

	<link rel="stylesheet" type="text/css" media="screen" href="css/global.css" />
</head>

<body>
	<div id="root" style="background: #fff">


	</div>

	<!-- Keep it, so old scripts can continue to work -->
	<div style="display:none">
		<font color="red">Screenshot ok</font>
	</div>

	<script type="text/javascript" src="css/global.js"></script>
	<script type="text/javascript">
		// Include core components and resounce bundle (needed)
      Shell.resource.set(null, {
          endpoints: {} 
      });
      Shell.create('Roku.Event.Key');
      Shell.create('Roku.Events.Resize');
      Shell.create('Roku.Events.Scroll');  

      // Create global navigation and render it
      var nav = Shell.create('Roku.Nav')
        .trigger('Enable standalone and utility mode - hide user menu, shopping cart, and etc.')
        .trigger('Use compact footer')
        .trigger('Hide footer')
        .trigger('Render', document.getElementById('root'))
        // Create custom links
        .trigger('Remove all feature links from header')
        .trigger('Add feature link in header', {
            text: 'Installer',
            url: 'plugin_install'
        })
        .trigger('Add feature link in header', {
            text: 'Utilities',
            url: 'plugin_inspect'
        })
        
        .trigger('Add feature link in header', { text: 'Packager', url: 'plugin_package' });
  
      // Retrieve main content body node
      var node = nav.invoke('Get main body section mounting node');
      
      // Create page container and page header
      var container = Shell.create('Roku.Nav.Page.Standard').trigger('Render', node);
      node = container.invoke('Get main body node');
      container.invoke('Get headline node').innerHTML = 'Package Utilities';

      // Set up form in main body content area
      form = Shell.create('Roku.Form')
        .trigger('Set form action URL', 'plugin_inspect')
        .trigger('Set form encryption type to multi-part')
        .trigger("Add file upload button", { 
            name: "archive",
            label: "Package name:" 
         })
        .trigger("Add input field", { 
           name: "passwd", 
            type: "password", 
            label: "Password", 
            placeholderLabel: false, 
            required: true, 
            errorMessage: "Please enter the password", 
         })          
        .trigger("Add hidden input field", {
            name: "mysubmit"
      });
      form.trigger('Render', node);

      // Render some buttons
      var Delete = document.createElement('BUTTON');
      Delete.className = 'roku-button';
      Delete.innerHTML = 'Inspect';
      Delete.onclick = function() {
          form.trigger('Update input field value', { name: 'mysubmit', value: 'Inspect'})
          if(form.invoke('Validate and get input values').valid === true) {
            form.trigger('Force submit');   
          }
      };
      node.appendChild(Delete);
      
      var hspace = document.createTextNode(" ")
      node.appendChild(hspace);

      // Render some buttons
      var convert = document.createElement('BUTTON');
      convert.className = 'roku-button';
      convert.innerHTML = 'Rekey';
      convert.onclick = function() {
          form.trigger('Update input field value', { name: 'mysubmit', value: 'Rekey'})
          if(form.invoke('Validate and get input values').valid === true) {
            form.trigger('Force submit');   
          }
      };
      node.appendChild(convert);
      
      var d = document.createElement('div');
      d.innerHTML="<br />";
      node.appendChild(d);


      // Render some buttons
      var submit = document.createElement('BUTTON');
      submit.className = 'roku-button';
      submit.innerHTML = 'Screenshot';
      submit.onclick = function() {
          form.trigger('Update input field value', { name: 'mysubmit', value: 'Screenshot'})
          form.trigger('Force submit');   
      };
      node.appendChild(submit);

      var hspace2 = document.createTextNode(" ")
      node.appendChild(hspace2);

      // Button: download profiling data
      var profButton = document.createElement('BUTTON');
      profButton.className = 'roku-button';
      profButton.innerHTML = 'Profiling Data';
      profButton.onclick = function() {
          form.trigger('Update input field value', { name: 'mysubmit', value: 'dloadProf'})
          form.trigger('Force submit');   
      };
      node.appendChild(profButton);

      var imgInfo = document.createElement('div');
      imgInfo.className = 'color-block roku-font-5';
      imgInfo.innerHTML = 'HD mode 1280x720 image required for channel store upload'
      node.appendChild(imgInfo);      

      // Render messages (info, error, and success)
      Shell.create('Roku.Message').trigger('Set message type', 'success').trigger('Set message content', 'Screenshot ok').trigger('Render', node);

      var screenshoot = document.createElement('div');
      screenshoot.innerHTML = '<hr /><img src="pkgs/dev.jpg?time=1577464492">';
      node.appendChild(screenshoot);      

	</script>

</body>

</html>`;
