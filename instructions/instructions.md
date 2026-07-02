# Site Version 2 Instructions

Today, we will create a website for a product I am working on demonstrated in [Here](../../../Projects/manhattan-reasoning-gym). 

I have a general Idea of How I want the Site to Look.

## Page Layout

I want the site to be an off-white background prioritizing simplicity. I want the site to be a scrolling down page. 

## Top Menu
Left: Logo.png(assets/Manhattan_Reasoning_Logo_2.png) -- Right: Cloud, Sandbox, Docs, Beta Access
(Note: As the user scrolls down, I want the logo to collapse into the turnstile symbol. See https://www.anthropic.com logo animation for inspiration).

- Cloud scrolls down to cloud section.
- Sandbox scrolls down to sandbox section.
- Docs just auto redirects to (docs.manhattanreasoning.com) 
- Beta Access scrolls down to beta access section.

## Landing Page

On the left side of the landing page, in a big helvetica font, we will have:
"Intelligence doesn’t stop at software."

Below this title, I want this short bio in a smaller font:
We're a small team of computer scientists bringing hardware reasoning to everyone. Our platform provides cloud silicon, open-source toolchains, and training environments where AI learns to design computer chips that are both correct and optimal.


On the right side of the landing page, we will take inspiration from "/Users/christianscaff/Documents/Academics/Columbia/Barnard-PL-Lab/Summer 2026/Projects/Cloud_FPGA/firmware/base/viz/cloud_fpga_soc_routing.png" and have an interactive routing congestion map in the same way "https://cognition.com/blog/frontier-code" has an interactive layout.

# Cloud

Title: Silicon Reasoning on the Cloud

Smaller: Prototype your Design on physical silicon in a few lines of code with our cloud FPGA cluster, Python SDK and CLI.

```python
import manhattan_reasoning_gym as mrg

class Regs(mrg.cloud.RegisterMap):
    DATA_IN  = 0x0004
    DATA_OUT = 0x0008

app = mrg.cloud.App(
    "my_design",
    design="design.py",
    registers=Regs
)

@app.local_entrypoint()
def main():
    with app:                # programs the FPGA, releases on exit
        app.write(Regs.DATA_IN, 0xDEADBEEF)
        print(hex(app.read(Regs.DATA_OUT)))
```

```
Put display of CLI when u are running "mrg run /design.py" from the project with the cool silly text it generates. See here for example of CLI "assets/Screenshot 2026-07-02 at 10.34.39 AM.png"
```

# Sandbox

Title: Train and benchmark hardware agents at the transistor level.

Smaller: Isolated sandboxes that make it easy to design, experiment, and verify on real silicon in a matter of minutes. We’re currently working on an RLVR environment designed by formal methods experts

```python
import manhattan_reasoning_gym as mrg

result = mrg.Sandbox(files=["examples/design.py", "examples/agent.py"]).run("agent.py")
for promo in result.promotions:
    print(promo)
```

# Beta Access

Dive into real silicon with two commands.

```pip install manhattan-reasoning-gym

docker pull ghcr.io/barnard-pl-labs/mrg-sandbox:latest
```

Title: What Will You Build?
Smaller Text: We’re looking for users to test our infrastructure. Request private beta access here.

Note: Can we generate a form to fill out for users to request access?

Notes: Inspired by scrolling style of https://www.tbench.ai

Notes: I also like the simplicty of sites like https://cognition.com/blog/frontier-code
