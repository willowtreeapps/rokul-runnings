export const sideloadResponse: string = `<html>
<head>
  <meta charset="utf-8" />
  <meta name="HandheldFriendly" content="True" />
  <title>Roku Development Kit</title>

  <link
    rel="stylesheet"
    type="text/css"
    media="screen"
    href="css/global.css"
  />
</head>

<body>
  <div id="root" style="background: #fff"></div>

  <!-- Keep it, so old scripts can continue to work -->
  <div style="display:none">
    <font color="red"
      >Application Received: Identical to previous version -- not replacing.
    </font>
    <font color="red"></font>
    <p>
      <font face="Courier"
        >6f0f2dc6fa3ce8c31f12ef18e98d8d09 <br />
        zip file in internal memory (488168 bytes)</font
      >
    </p>
  </div>

  <script type="text/javascript" src="css/global.js"></script>
  <script type="text/javascript">
    // Include core components and resounce bundle (needed)
    Shell.resource.set(null, {
      endpoints: {}
    });
    Shell.create("Roku.Event.Key");
    Shell.create("Roku.Events.Resize");
    Shell.create("Roku.Events.Scroll");

    // Create global navigation and render it
    var nav = Shell.create("Roku.Nav")
      .trigger(
        "Enable standalone and utility mode - hide user menu, shopping cart, and etc."
      )
      .trigger("Use compact footer")
      .trigger("Hide footer")
      .trigger("Render", document.getElementById("root"))
      // Create custom links
      .trigger("Remove all feature links from header")
      .trigger("Add feature link in header", {
        text: "Installer",
        url: "plugin_install"
      })
      .trigger("Add feature link in header", {
        text: "Utilities",
        url: "plugin_inspect"
      })

      .trigger("Add feature link in header", {
        text: "Packager",
        url: "plugin_package"
      });

    // Retrieve main content body node
    var node = nav.invoke("Get main body section mounting node");

    // Create page container and page header
    var container = Shell.create("Roku.Nav.Page.Standard").trigger(
      "Render",
      node
    );
    node = container.invoke("Get main body node");
    container.invoke("Get headline node").innerHTML =
      "Development Application Installer";

    node.innerHTML =
      '<p>Currently Installed Application:</p><p><font face="Courier">6f0f2dc6fa3ce8c31f12ef18e98d8d09 <br /> zip file in internal memory (488168 bytes)</font></p>';

    // Set up form in main body content area
    form = Shell.create("Roku.Form")
      .trigger("Set form action URL", "plugin_install")
      .trigger("Set form encryption type to multi-part")
      .trigger("Add file upload button", {
        name: "archive",
        label: "File:"
      })
      .trigger("Add hidden input field", {
        name: "mysubmit"
      });

    // Render some buttons
    var Delete = document.createElement("BUTTON");
    Delete.className = "roku-button";
    Delete.innerHTML = "Delete";
    Delete.onclick = function() {
      form.trigger("Update input field value", {
        name: "mysubmit",
        value: "Delete"
      });
      form.trigger("Force submit");
    };
    node.appendChild(Delete);

    if (true) {
      // Render some buttons
      var convert = document.createElement("BUTTON");
      convert.className = "roku-button";
      convert.innerHTML = "Convert to cramfs";
      convert.onclick = function() {
        form.trigger("Update input field value", {
          name: "mysubmit",
          value: "Convert to cramfs"
        });
        form.trigger("Force submit");
      };
      node.appendChild(convert);

      var convert2 = document.createElement("BUTTON");
      convert2.className = "roku-button";
      convert2.innerHTML = "Convert to squashfs";
      convert2.onclick = function() {
        form.trigger("Update input field value", {
          name: "mysubmit",
          value: "Convert to squashfs"
        });
        form.trigger("Force submit");
      };
      node.appendChild(convert2);
    }

    var hrDiv = document.createElement("div");
    hrDiv.innerHTML = "<hr />";
    node.appendChild(hrDiv);

    form.trigger("Render", node);

    // Render some buttons
    var submit = document.createElement("BUTTON");
    submit.className = "roku-button";
    submit.innerHTML = "Replace";
    submit.onclick = function() {
      form.trigger("Update input field value", {
        name: "mysubmit",
        value: "replace"
      });
      if (form.invoke("Validate and get input values").valid === true) {
        form.trigger("Force submit");
      }
    };
    node.appendChild(submit);

    var d = document.createElement("div");
    d.innerHTML = "<br />";
    node.appendChild(d);

    // Reder messages (info, error, and success)
    Shell.create("Roku.Message")
      .trigger("Set message type", "info")
      .trigger(
        "Set message content",
        "Application Received: Identical to previous version -- not replacing."
      )
      .trigger("Render", node);
  </script>
</body>
</html>`;
