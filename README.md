# WORK-IN-PROGRESS
Don't expect everything to function perfectly. <br>
Please check back frequently as I am making constant updates and improvements... <br>
Here you will find a collection of custom nodes for ComfyUI with the intent of enhancing your film production workflow. <br><br>
Let me preface by saying that I am not a developer by trade, nor do I have a background in programming. I come from a traditional filmmaking background, with my focus being writing, directing, and cinematography. <br>
With that said, I have been following the AI scene for quite some time now, working behind the scene on ways to implement AI into my own personal workflow and finding ways to utilize it as a tool, rather than try to fight it's constant progression - a battle that we cannot win. <br><br>
The current highlight of this collection is a massive LTXV all-in-one node, Film Auteur (LTXV), which was designed with LTX 2.3 as the backbone. <br>
What started off as a simple idea to create a node for injecting reference images into LTX quickly became a highly ambitious project. <br>
It's not perfect, but it works. <br>
At first glance, I'm sure the node looks overwhelming, with so much packed into it, but I assure you it's really not that bad, and can easily be broken down into sections to better understand it. <br>

# Nodes

<u>Film Auteur (LTXV)</u> - one node to rule them all. <br>
&emsp;• Text-to-Video <br>
&emsp;• Image-to-Video <br>
&emsp;• Image Reference-to-Video (experimental work-in-progress) <br>
&emsp;• Audio-to-Video <br>
&emsp;• Audio Reference (with ID-LoRA) <br>
&emsp;• Ollama integration for prompt enhancement (Gemma 4 26b recommended) <br>
&emsp;• Length input as seconds (calculated & converted to frame count internally based on fps) <br>
&emsp;• Multi-shot inferencing using "|" separators between prompts <br>
&emsp;• first_frame input accepts image batch for storyboard processing (1 shot per image coinciding with multi-prompt input) <br>
&emsp;• Inifinite (truly) length by use of autoregressive chunking and built-in sliding context windows <br>
&emsp;• Up to 3 sampling stages for built-in upsampling (model2_opt if wanted for stages 2 & 3) <br>
&emsp;• Temporal upscaling option (enable to double framerate and visual refinement) <br>
&emsp;• Face restoration to help with cleaning up faces and removing artifacts<br>
&emsp;&ensp;(place face restore model with .pt or .pth file extension in "facerestore_models" folder (eg. <a href="https://huggingface.co/models? search=codeformer">codeformer</a>, <a href="https://huggingface.co/models?search=gfpgan">GFPGAN</a>, etc.)) <br>
&emsp;• Built-in sageattention and fp16 accumulation (must be installed to use) <br>
&emsp;• Built in chunk feed forward (to assist in computational efficiency) <br>
&emsp;• Built in stage 1 preview <br>

Note: Refer to the tooltips for important information. <br><br>
Just plug in your models, optional reference images and/or audio, set your desired paramerters, send it out to your preferred video save or combine node, and you're good-to-go. <br><br>
More nodes coming soon... <br><br>

# Installation
1. cd custom_nodes <br>
2. git clone https://github.com/triXope/ComfyUI-triXope.git <br>
3. Restart ComfyUI <br>
