---
title: General-Purpose Learning Agents: From Models to Agents That Learn
authors: [yves]
tags: [agent, embodied ai, learning, memory]
date: 2026-11-17
section: article
---

# General-Purpose Learning Agents: From Models to Agents That Learn

*Some Thoughts on Agents, Harnesses, Learning, Memory, and Robotics*

## 1. What Am I Really Interested In?

Over the past few months, I've explored a variety of technologies that seem to belong to different fields: from my early chatbot project, Project CHIE, to agent harnesses and long-term memory, and later to computer vision, robot learning, VLA, reinforcement learning, and world models.

At first glance, these topics may seem somewhat disconnected. But I've gradually realized that the fundamental question driving my curiosity has remained the same:

**How can we build an agent that can learn autonomously, accumulate experience, acquire new capabilities, and continuously adapt to its environment?**

I'm not particularly concerned with whether a robot has a humanoid body. Humanoid designs may be suitable for certain tasks, but they shouldn't define what intelligence is.

Rather than studying how to make a specific robotic arm perform a particular manipulation task, I'm more interested in why an agent can learn to operate that arm in the first place. What knowledge has it acquired? Can that knowledge transfer to a different embodiment, a different tool, or even an entirely new task?

What I ultimately want to build is not merely **a model that knows how to use a robot**, but **an agent that can learn how to use robots**.

In fact, at this stage, I don't think it's even necessary to restrict the scope of my research to the physical world.

An agent that learns to use terminals, browsers, and APIs, and an agent that learns to manipulate a robotic arm, may face some fundamentally similar challenges: understanding the environment, exploring the unknown, learning from feedback, accumulating experience, and transferring previously acquired capabilities to new tasks.

This is the research direction that currently interests me most: **General-Purpose Learning Agents**.

## 2. Agent Does Not Mean LLM Agent

Today, when people talk about agents, they often think of coding agents, browser agents, or software systems built around LLMs with tool-calling capabilities.

But the concept of an agent existed long before the LLM era.

Under a broad definition, a system that perceives its environment, makes decisions, and takes actions can be considered an agent.

An autonomous navigation robot is an agent. An autonomous control system can be an agent. A coding agent is also an agent.

**An LLM is not a necessary component of an agent. Learning isn't necessarily required, either.**

An LLM is one possible foundation for intelligence. A harness is a system framework for organizing an agent's operation. A robot is one possible embodiment through which an agent interacts with the physical world.

These concepts shouldn't be conflated.

I believe the more interesting question is not what model an agent uses or how many tools it has, but whether it possesses the ability to learn and adapt.

Consider an agent equipped with hundreds of tools, capable of executing complex workflows, but fundamentally limited to following predefined procedures. To me, such a system is meaningfully different from an agent that can continuously acquire new capabilities through interaction.

It's the latter that I want to study.

## 3. What Is the Nature of Learning?

This is a question I've repeatedly returned to.

Traditional machine learning can easily lead us to associate learning with updating neural network parameters through training.

But if we shift our focus from models to agents, is that definition still sufficient?

Suppose an agent's underlying model parameters remain completely unchanged, yet the agent continuously improves its behavior through external memory, accumulated experience, skill generation, and tool use.

Has the agent learned anything?

My answer is: **The model may not have learned, but the agent can have learned.**

The key is to first establish the boundary of the system we're discussing.

A model is a component of an agent. An agent, meanwhile, may consist of a model, memory, tools, planners, execution environments, and other mechanisms capable of persistently influencing its behavior.

If the model's parameters remain fixed, but the overall system acquires capabilities it previously lacked through experience, and those capabilities continue to be useful in the future, I think it's reasonable to call this *agent-level learning*.

Therefore, I prefer to evaluate learning in terms of **persistent improvements in behavioral capabilities**, rather than simply checking whether internal parameters have changed.

Of course, this doesn't mean that every form of external memory constitutes learning.

Remembering a previously successful operation is not the same as mastering a general method for solving a class of problems. Simply caching answers doesn't necessarily imply the acquisition of generalizable capabilities.

When discussing learning, we should at least ask:

- Does the improvement persist across future tasks?
- Can past experience remain useful when the agent encounters situations it has never seen before?
- Is the improvement genuinely caused by interaction and experience, rather than accidental success?

I don't believe that modifying internal parameters is the only way to learn. But I also don't believe that attaching a memory system to a model automatically produces continual learning.

**Changes in internal structure are a means to an end. What I ultimately care about is a persistent improvement in the agent's behavioral capabilities.**

## 4. Memory, Harnesses, and Learning

As I've explored agent systems, I've become increasingly aware that the mechanisms surrounding foundation models are also worth studying.

Consider long-term memory.

If we treat memory as nothing more than an ever-growing database of conversation records, its capabilities will be fairly limited.

A truly useful memory system should be able to answer questions such as: Which experiences are worth preserving? How should different experiences be integrated? When should memories be retrieved? Which memories have become outdated? Can past failures influence future decisions?

These questions involve more than storage and retrieval. They concern memory formation, consolidation, updating, forgetting, and the evaluation of memory utility.

However, I've always been skeptical of a particular narrative: that if an agent experiences enough failures, an LLM can simply summarize those experiences and somehow extract general rules.

For example, after a thousand failed grasping attempts, can a model really infer grasping principles that generalize across different robots, objects, and environments?

Not necessarily.

How much generalization can be supported by limited experience is itself a question that requires research and empirical validation. Producing a plausible textual summary doesn't mean the agent has acquired reliable, transferable knowledge.

And that is precisely what makes this problem interesting.

Similar questions arise when thinking about harnesses.

I tend to view a harness as the system layer that organizes an agent's operation. It manages context, invokes tools, coordinates execution, processes feedback, and mediates interactions between the model and its environment.

In some implementations, it may also handle memory management, skill scheduling, and task verification.

What interests me is this:

**Can a harness evolve from a fixed execution framework into a system that can itself be learned and improved?**

For example, can an agent gradually learn when to invoke tools, when to search for information, when an experience is worth remembering, and when its original plan should be revised?

Can it even improve its own workflows, tool combinations, and skill organization based on feedback from real tasks?

Such improvements don't necessarily have to occur in neural network weights. They could emerge through changes to external programs, skill libraries, memory structures, or task-scheduling policies.

To me, what matters isn't where the changes occur, but whether they produce genuine, verifiable improvements in capability.

## 5. From Software Agents to Physical Agents

Why am I still so interested in robotics?

Because the physical world provides an exceptionally challenging environment for interaction.

In software environments, agents interact through APIs, command-line interfaces, browsers, or code. They can execute actions, observe the results, and sometimes automatically verify whether a task has been completed.

The physical world can support a similar feedback loop:

**Perceive the environment → Make decisions → Execute actions → Receive feedback → Improve the policy.**

However, the physical world introduces additional constraints.

Sensor information may be incomplete. Actions may fail. Environments are uncertain. Interactions have real costs in time and resources. Some mistakes may even have irreversible consequences.

This leads me to an interesting question.

Suppose we already have an extremely capable pretrained LLM.

Now we give it a robot with an unfamiliar structure, along with stable control interfaces, sufficient sensor information, and opportunities to interact with the environment.

Could it gradually learn to operate this robot through a limited amount of exploration?

My intuition is that this should be possible, at least in principle.

Humans can learn to drive cars or operate unfamiliar machinery. We aren't born with these abilities. Instead, we acquire them by combining prior knowledge with observation, experimentation, and feedback.

Of course, this analogy doesn't prove that LLMs necessarily possess the same learning capabilities.

Even with abundant sensor information, an agent may lack effective exploration strategies, suitable action representations, or learning mechanisms.

Conversely, even with limited sensory input, an agent may be able to acquire additional information through active exploration. What matters isn't simply the number of sensors, but whether the agent can obtain the information necessary to accomplish its task and whether it has sufficient control over the environment.

If certain environmental states are indistinguishable to the agent but require different actions, reliably solving the task may be impossible due to fundamental information constraints.

Therefore, I don't believe that connecting a powerful LLM to a robot's APIs will automatically produce general-purpose robotic intelligence.

But I do believe that **enabling an agent with broad prior knowledge to learn how to use unfamiliar bodies and tools** is a highly worthwhile research problem.

And there's no reason this research must begin with humanoid robots.

Robotic arms, wheeled robots, quadrupeds, and even software tools can all serve as different environments for studying learning and transfer.

## 6. From Completing Tasks to Acquiring Capabilities

There's another distinction I consider particularly important:

**An agent successfully completing a task doesn't necessarily mean it has learned how to solve that class of tasks.**

A model may already possess the knowledge required for a task through extensive pretraining. If it successfully uses a tool on its first attempt, that doesn't necessarily indicate that learning occurred during the interaction.

Likewise, if a model makes many attempts and eventually succeeds, that alone doesn't prove it has acquired a transferable capability.

Establishing such a claim requires more rigorous experiments.

I want to distinguish between two questions:

**Performance: What can the agent accomplish right now?**

**Learning: How does the agent acquire capabilities it previously lacked through experience?**

The former concerns current capabilities. The latter concerns the process by which those capabilities change.

For the General-Purpose Learning Agents I'm interested in, the second question is especially important.

This perspective also helps clarify the relationships among reinforcement learning, world models, memory, and harnesses.

Reinforcement learning studies how policies can be improved through feedback from interaction. World models concern how agents represent and predict changes in their environments. Memory concerns how past information can be preserved and utilized. A harness can organize these mechanisms and coordinate their interactions with the external world.

These concepts aren't mutually exclusive, nor are they necessarily all required components of an agent.

I don't want to assume in advance that any particular architecture represents the ultimate solution.

The more fundamental question is:

What mechanisms allow agents to continuously acquire new skills with lower interaction costs, greater reliability, and better generalization?

We might even go one step further: Can an agent learn how to learn more effectively?

To me, that question is closer to my long-term interests than simply achieving a higher score on a particular benchmark.

## 7. I Want to Study Learning Agents, Not Just a Particular Model

Returning to the original question.

If my ultimate goal is to study intelligence, robotics shouldn't define the boundaries of my research. Instead, it should be one of the most important environments in which that research takes place.

Nor should LLMs automatically be treated as the final architecture for intelligence. They may be an excellent starting point, but there are still many open questions about how models reason, interact with environments, and continuously improve through experience.

At the moment, I'm particularly interested in three directions.

**First, Agent-Level Learning.**

When the foundation model's parameters remain fixed, to what extent can external memory, skills, and programs produce genuine, persistent, and transferable learning? How should we evaluate such improvements?

**Second, Learning Through Interaction.**

How should an agent explore its environment, identify valuable experiences, and maximize learning progress under a limited interaction budget?

**Third, Generalization Across Tools and Embodiments.**

Can an agent transfer existing knowledge and skills to unfamiliar tools, tasks, environments, and even entirely different robotic embodiments?

These questions aren't independent. Together, they point toward a common objective:

**Building general-purpose learning agents that continuously acquire new capabilities through interaction and transfer those capabilities to unfamiliar situations.**

This is why I want to continue exploring agents, harnesses, memory, reinforcement learning, and world models alongside my research in robot learning.

I'm still far from having a complete technical solution, and I don't believe there's already a clearly established path toward this goal.

For now, these thoughts are primarily an attempt to organize my research interests and long-term objectives. Any meaningful conclusions will ultimately need to be supported by theory, experiments, and reproducible evidence.

But there's at least one thing I'm more certain about than before:

**I don't merely want to study how to train a model to perform more predefined tasks. I want to understand how to build an agent that can continually acquire new capabilities.**

Robots can be its bodies. Software can be its tools. The environment can be its teacher.

As for what form intelligence should ultimately take, I'm in no hurry to settle on an answer.

>Yves Yao

>2026/11/17

>At XDU

{/* truncate */}